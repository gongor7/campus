import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationEntity } from '../simulations/simulation.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
import { PILOT_SIMULATION } from './content';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(SimulationEntity)
    private readonly simulations: Repository<SimulationEntity>,
    @InjectRepository(ScenarioEntity)
    private readonly scenarios: Repository<ScenarioEntity>,
    @InjectRepository(DecisionEntity)
    private readonly decisions: Repository<DecisionEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedPilot();
  }

  /** Idempotente: si la simulación ya existe (por slug), no hace nada. */
  async seedPilot(): Promise<void> {
    const existing = await this.simulations.findOne({ where: { slug: PILOT_SIMULATION.slug } });
    if (existing) {
      this.logger.log('Seed omitido: la simulación piloto ya existe');
      return;
    }

    const simulation = await this.simulations.save(
      this.simulations.create({
        slug: PILOT_SIMULATION.slug,
        title: PILOT_SIMULATION.title,
        objective: PILOT_SIMULATION.objective,
        description: PILOT_SIMULATION.description,
      }),
    );

    // Insertar escenarios y mapear código -> id para resolver las ramas.
    const scenarioIds = new Map<string, number>();
    for (const s of PILOT_SIMULATION.scenarios) {
      const scenario = await this.scenarios.save(
        this.scenarios.create({
          simulationId: simulation.id,
          code: s.code,
          title: s.title,
          context: s.context,
          information: s.information,
          question: s.question,
        }),
      );
      scenarioIds.set(s.code, scenario.id);
    }

    for (const s of PILOT_SIMULATION.scenarios) {
      const scenarioId = scenarioIds.get(s.code)!;
      for (const d of s.decisions) {
        await this.decisions.save(
          this.decisions.create({
            scenarioId,
            code: d.code,
            label: d.label,
            consequence: d.consequence,
            feedback: d.feedback,
            score: d.score,
            nextScenarioId: d.nextScenarioCode ? scenarioIds.get(d.nextScenarioCode)! : null,
          }),
        );
      }
    }

    this.logger.log(`Seed completo: "${PILOT_SIMULATION.title}" (${PILOT_SIMULATION.scenarios.length} escenarios)`);
  }
}
