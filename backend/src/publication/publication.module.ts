import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../courses/course.entity';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity]), AuditModule],
  providers: [PublicationService],
  controllers: [PublicationController],
})
export class PublicationModule {}
