import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { LessonProgressEntity } from './lesson-progress.entity';
import { LessonEntity } from '../courses/lesson.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { StudentsModule } from '../students/students.module';
import { CoursesModule } from '../courses/courses.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentEntity, LessonProgressEntity, LessonEntity]),
    StudentsModule,
    CoursesModule,
    AuditModule,
  ],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
