import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AttemptEntity } from './attempt.entity';
import { QuestionEntity } from '../question-banks/question.entity';

/** Persiste el texto exacto presentado al estudiante (decision D-4). */
@Entity('attempt_questions')
@Index('ix_attempt_question_attempt', ['attemptId'])
export class AttemptQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  attemptId: string;

  @ManyToOne(() => AttemptEntity)
  @JoinColumn({ name: 'attemptId' })
  attempt: AttemptEntity;

  @Column()
  questionId: number;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity;

  @Column({ type: 'text' })
  variantCase: string;

  @Column({ type: 'text', nullable: true })
  answer: string | null;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;
}
