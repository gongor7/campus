import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionBankEntity } from './question-bank.entity';

export interface VariationTemplate {
  variableAspects: string[];
  constraints: string;
}

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bankId: number;

  @ManyToOne(() => QuestionBankEntity, (bank) => bank.questions)
  @JoinColumn({ name: 'bankId' })
  bank: QuestionBankEntity;

  @Column({ type: 'int' })
  position: number;

  /** Enunciado del caso base (RF-15: exige aplicar el material). */
  @Column({ type: 'text' })
  caseText: string;

  @Column({ type: 'text' })
  prompt: string;

  /** Conceptos que la rubrica busca en la respuesta (RF-22, RF-23). */
  @Column({ type: 'jsonb' })
  expectedConcepts: string[];

  @Column({ type: 'jsonb' })
  sourceRefs: string[];

  /** Que puede variar entre intentos, dentro de lo aprobado (RF-16, RF-19). */
  @Column({ type: 'jsonb' })
  variationTemplate: VariationTemplate;

  @CreateDateColumn()
  createdAt: Date;
}
