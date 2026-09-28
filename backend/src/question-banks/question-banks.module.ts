import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionBankEntity } from './question-bank.entity';
import { QuestionEntity } from './question.entity';
import { CourseGenerationEntity } from '../generation/course-generation.entity';
import { QuestionBanksService } from './question-banks.service';
import { QuestionBanksController } from './question-banks.controller';
import { CoursesModule } from '../courses/courses.module';
import { SourcesModule } from '../sources/sources.module';
import { AuditModule } from '../audit/audit.module';
import { GenerationModule } from '../generation/generation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionBankEntity, QuestionEntity, CourseGenerationEntity]),
    CoursesModule,
    SourcesModule,
    AuditModule,
    GenerationModule,
  ],
  providers: [QuestionBanksService],
  controllers: [QuestionBanksController],
  exports: [QuestionBanksService],
})
export class QuestionBanksModule {}
