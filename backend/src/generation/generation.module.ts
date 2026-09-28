import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseGenerationEntity } from './course-generation.entity';
import { LessonEntity } from '../courses/lesson.entity';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';
import { CoursesModule } from '../courses/courses.module';
import { SourcesModule } from '../sources/sources.module';
import { TemplatesModule } from '../templates/templates.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseGenerationEntity, LessonEntity]),
    CoursesModule,
    SourcesModule,
    TemplatesModule,
    AuditModule,
  ],
  providers: [GenerationService, MockProvider, GeminiProvider],
  controllers: [GenerationController],
})
export class GenerationModule {}
