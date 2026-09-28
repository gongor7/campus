import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttemptEntity } from './attempt.entity';
import { AttemptQuestionEntity } from './attempt-question.entity';
import { EnrollmentEntity } from '../enrollments/enrollment.entity';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { StudentsModule } from '../students/students.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { QuestionBanksModule } from '../question-banks/question-banks.module';
import { CoursesModule } from '../courses/courses.module';
import { GenerationModule } from '../generation/generation.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttemptEntity, AttemptQuestionEntity, EnrollmentEntity]),
    StudentsModule,
    EnrollmentsModule,
    QuestionBanksModule,
    CoursesModule,
    GenerationModule,
    AuditModule,
  ],
  providers: [AttemptsService],
  controllers: [AttemptsController],
})
export class AttemptsModule {}
