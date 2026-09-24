import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SimulationEntity } from '../simulations/simulation.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { AttemptStepEntity } from './attempt-step.entity';

export type AttemptStatus = 'in_progress' | 'completed';

@Entity('attempts')
export class AttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId: string;

  @Column()
  simulationId: number;

  @ManyToOne(() => SimulationEntity)
  @JoinColumn({ name: 'simulationId' })
  simulation: SimulationEntity;

  @Column({ type: 'int', nullable: true })
  currentScenarioId: number | null;

  @ManyToOne(() => ScenarioEntity)
  @JoinColumn({ name: 'currentScenarioId' })
  currentScenario: ScenarioEntity;

  @Column({ type: 'varchar', default: 'in_progress' })
  status: AttemptStatus;

  @Column({ type: 'int', default: 0 })
  score: number;

  /** Suma de los máximos alcanzables de los escenarios recorridos. */
  @Column({ type: 'int', default: 0 })
  maxScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => AttemptStepEntity, (step) => step.attempt)
  steps: AttemptStepEntity[];
}
