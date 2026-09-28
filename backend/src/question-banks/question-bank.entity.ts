import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionEntity } from './question.entity';

export type BankStatus = 'DRAFT' | 'APPROVED';

/** Un banco por curso (decision D-3): el contenido publicado es inmutable. */
@Entity('question_banks')
export class QuestionBankEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  courseId: number;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: BankStatus;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => QuestionEntity, (question) => question.bank)
  questions: QuestionEntity[];
}
