import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../courses/course.entity';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { AuditModule } from '../audit/audit.module';
import { QuestionBanksModule } from '../question-banks/question-banks.module';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity]), AuditModule, QuestionBanksModule, SourcesModule],
  providers: [PublicationService],
  controllers: [PublicationController],
})
export class PublicationModule {}
