import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseGenerationEntity } from './course-generation.entity';
import { LessonEntity } from '../courses/lesson.entity';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';
import { AiProviderService } from './ai-provider.service';
import { CoursesModule } from '../courses/courses.module';
import { SourcesModule } from '../sources/sources.module';
import { TemplatesModule } from '../templates/templates.module';
import { AuditModule } from '../audit/audit.module';
import { SettingsModule } from '../settings/settings.module';
import { SettingsController } from '../settings/settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseGenerationEntity, LessonEntity]),
    CoursesModule,
    SourcesModule,
    TemplatesModule,
    AuditModule,
    SettingsModule,
  ],
  providers: [GenerationService, MockProvider, GeminiProvider, AiProviderService],
  controllers: [GenerationController, SettingsController],
  exports: [AiProviderService],
})
export class GenerationModule {}
