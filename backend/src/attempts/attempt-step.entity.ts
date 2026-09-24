import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttemptEntity } from './attempt.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';

@Entity('attempt_steps')
@Index('uq_attempt_scenario', ['attemptId', 'scenarioId'])
export class AttemptStepEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  attemptId: string;

  @ManyToOne(() => AttemptEntity, (attempt) => attempt.steps)
  @JoinColumn({ name: 'attemptId' })
  attempt: AttemptEntity;

  @Column()
  scenarioId: number;

  @ManyToOne(() => ScenarioEntity)
  @JoinColumn({ name: 'scenarioId' })
  scenario: ScenarioEntity;

  @Column()
  decisionId: number;

  @ManyToOne(() => DecisionEntity, (decision) => decision.steps)
  @JoinColumn({ name: 'decisionId' })
  decision: DecisionEntity;

  /** Orden del paso dentro del intento. */
  @Column({ type: 'int' })
  position: number;

  @CreateDateColumn()
  createdAt: Date;
}
