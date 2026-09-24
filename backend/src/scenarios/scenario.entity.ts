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
import { DecisionEntity } from '../decisions/decision.entity';

export interface Indicator {
  name: string;
  value: string;
  trend?: string;
  note?: string;
}

export interface ScenarioInformation {
  indicators: Indicator[];
  documents?: { title: string; summary: string }[];
  notes?: string[];
}

@Entity('scenarios')
@Index('uq_scenario_code', ['simulationId', 'code'])
export class ScenarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  simulationId: number;

  @ManyToOne(() => SimulationEntity, (simulation) => simulation.scenarios)
  @JoinColumn({ name: 'simulationId' })
  simulation: SimulationEntity;

  /** Código estable del escenario dentro de la simulación (ej. 'E1'). */
  @Column()
  code: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  context: string;

  @Column({ type: 'jsonb' })
  information: ScenarioInformation;

  @Column({ type: 'text' })
  question: string;

  @OneToMany(() => DecisionEntity, (decision) => decision.scenario)
  decisions: DecisionEntity[];
}
