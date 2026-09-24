import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ScenarioEntity } from '../scenarios/scenario.entity';

@Entity('simulations')
export class SimulationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  objective: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ScenarioEntity, (scenario) => scenario.simulation)
  scenarios: ScenarioEntity[];
}
