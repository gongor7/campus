import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StudentEntity } from '../students/student.entity';
import { CourseEntity } from '../courses/course.entity';

export type EnrollmentStatus = 'IN_PROGRESS' | 'COMPLETED';

@Entity('enrollments')
@Index('uq_enrollment_student_course', ['studentId', 'courseId'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column()
  courseId: number;

  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column({ type: 'varchar', length: 20, default: 'IN_PROGRESS' })
  status: EnrollmentStatus;

  /** Mejor puntaje entre intentos calificados (decision B8). */
  @Column({ type: 'int', nullable: true })
  bestScore: number | null;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
