import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nombre original del registro; no se actualiza en reingresos (decision B2). */
  @Column({ length: 120 })
  name: string;

  @Column({ length: 200, unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
