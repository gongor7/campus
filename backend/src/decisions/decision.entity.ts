import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { AttemptStepEntity } from '../attempts/attempt-step.entity';

@Entity('decisions')
@Index('uq_decision_code', ['scenarioId', 'code'])
export class DecisionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  scenarioId: number;

  @ManyToOne(() => ScenarioEntity, (scenario) => scenario.decisions)
  @JoinColumn({ name: 'scenarioId' })
  scenario: ScenarioEntity;

  /** Código estable de la alternativa dentro del escenario (ej. 'A'). */
  @Column()
  code: string;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'text' })
  consequence: string;

  @Column({ type: 'text' })
  feedback: string;

  /** Puntaje 0–100 de la decisión. Nunca se expone antes del resultado final. */
  @Column({ type: 'int' })
  score: number;

  /**
   * Siguiente escenario según esta decisión (null = fin de la simulación).
   * Se resuelve por código en el seed.
   */
  @Column({ type: 'int', nullable: true })
  nextScenarioId: number | null;

  @OneToMany(() => AttemptStepEntity, (step) => step.decision)
  steps: AttemptStepEntity[];
}
