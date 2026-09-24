import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptEntity } from './attempt.entity';
import { AttemptStepEntity } from './attempt-step.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
import { EvaluationService } from '../evaluation/evaluation.service';

export interface PublicScenario {
  id: number;
  code: string;
  title: string;
  context: string;
  information: ScenarioEntity['information'];
  question: string;
  decisions: { id: number; code: string; label: string }[];
}

@Injectable()
export class AttemptsService {
  constructor(
    @InjectRepository(AttemptEntity)
    private readonly attempts: Repository<AttemptEntity>,
    @InjectRepository(AttemptStepEntity)
    private readonly steps: Repository<AttemptStepEntity>,
    @InjectRepository(ScenarioEntity)
    private readonly scenarios: Repository<ScenarioEntity>,
    @InjectRepository(DecisionEntity)
    private readonly decisions: Repository<DecisionEntity>,
    private readonly evaluation: EvaluationService,
  ) {}

  async create(simulationId: number, sessionId: string): Promise<{ attempt: AttemptEntity; scenario: PublicScenario }> {
    const firstScenario = await this.scenarios.findOne({
      where: { simulationId },
      order: { id: 'ASC' },
    });
    if (!firstScenario) throw new NotFoundException('La simulación no tiene escenarios');

    const attempt = await this.attempts.save(
      this.attempts.create({ sessionId, simulationId, currentScenarioId: firstScenario.id }),
    );
    return { attempt, scenario: await this.toPublicScenario(firstScenario.id) };
  }

  async findById(id: string): Promise<AttemptEntity> {
    const attempt = await this.attempts.findOne({ where: { id } });
    if (!attempt) throw new NotFoundException('Intento no encontrado');
    return attempt;
  }

  async getState(id: string): Promise<{ attempt: AttemptEntity; scenario: PublicScenario | null }> {
    const attempt = await this.findById(id);
    const scenario = attempt.status === 'completed' || !attempt.currentScenarioId
      ? null
      : await this.toPublicScenario(attempt.currentScenarioId);
    return { attempt, scenario };
  }

  async decide(attemptId: string, decisionId: number) {
    const attempt = await this.findById(attemptId);
    if (attempt.status === 'completed') {
      throw new BadRequestException('El intento ya está completado');
    }
    if (!attempt.currentScenarioId) {
      throw new BadRequestException('El intento no tiene un escenario activo');
    }

    const scenarioId = attempt.currentScenarioId;
    const decision = await this.decisions.findOne({ where: { id: decisionId } });
    if (!decision) throw new NotFoundException('Decisión no encontrada');
    if (decision.scenarioId !== scenarioId) {
      throw new BadRequestException('La decisión no pertenece al escenario actual');
    }

    const existing = await this.steps.findOne({ where: { attemptId, scenarioId } });
    if (existing) {
      throw new BadRequestException('El escenario actual ya fue decidido en este intento');
    }

    const scenarioDecisions = await this.decisions.find({ where: { scenarioId } });
    const outcome = this.evaluation.evaluate(decision, scenarioDecisions);

    const position = await this.steps.count({ where: { attemptId } });
    await this.steps.save(
      this.steps.create({ attemptId, scenarioId, decisionId, position }),
    );

    attempt.score += outcome.awardedScore;
    attempt.maxScore += outcome.scenarioMaxScore;

    let nextScenario: PublicScenario | null = null;
    if (outcome.isTerminal) {
      attempt.status = 'completed';
      attempt.currentScenarioId = null;
      attempt.completedAt = new Date();
    } else {
      attempt.currentScenarioId = outcome.nextScenarioId;
      nextScenario = await this.toPublicScenario(outcome.nextScenarioId!);
    }
    await this.attempts.save(attempt);

    return {
      consequence: decision.consequence,
      feedback: decision.feedback,
      // Máximo alcanzable del paso; el puntaje obtenido se revela solo al final.
      stepMaxScore: outcome.scenarioMaxScore,
      completed: outcome.isTerminal,
      nextScenario,
    };
  }

  async getResult(attemptId: string) {
    const attempt = await this.findById(attemptId);
    if (attempt.status !== 'completed') {
      throw new BadRequestException('El intento aún no está completado');
    }
    const steps = await this.steps.find({
      where: { attemptId },
      relations: { scenario: true, decision: true },
      order: { position: 'ASC' },
    });
    return {
      attemptId: attempt.id,
      simulationId: attempt.simulationId,
      score: attempt.score,
      maxScore: attempt.maxScore,
      steps: steps.map((s) => ({
        position: s.position,
        scenarioTitle: s.scenario.title,
        question: s.scenario.question,
        decisionLabel: s.decision.label,
        feedback: s.decision.feedback,
        score: s.decision.score,
      })),
    };
  }

  private async toPublicScenario(scenarioId: number): Promise<PublicScenario> {
    const scenario = await this.scenarios.findOne({
      where: { id: scenarioId },
      relations: { decisions: true },
    });
    if (!scenario) throw new NotFoundException('Escenario no encontrado');
    return {
      id: scenario.id,
      code: scenario.code,
      title: scenario.title,
      context: scenario.context,
      information: scenario.information,
      question: scenario.question,
      // Nunca se exponen score/consequence/feedback de las alternativas.
      decisions: scenario.decisions
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((d) => ({ id: d.id, code: d.code, label: d.label })),
    };
  }
}
