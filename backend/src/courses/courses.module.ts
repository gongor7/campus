import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { CourseModuleEntity } from './course-module.entity';
import { LessonEntity } from './lesson.entity';
import { CourseSectionEntity } from './course-section.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { AuditModule } from '../audit/audit.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, CourseModuleEntity, LessonEntity, CourseSectionEntity]),
    AuditModule,
    TemplatesModule,
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
