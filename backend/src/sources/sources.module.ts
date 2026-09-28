import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceSetEntity } from './source-set.entity';
import { SourceEntity } from './source.entity';
import { SourceFileEntity } from './source-file.entity';
import { StorageService } from './storage.service';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([SourceSetEntity, SourceEntity, SourceFileEntity]), AuditModule],
  providers: [StorageService, SourcesService],
  controllers: [SourcesController],
  exports: [SourcesService, StorageService],
})
export class SourcesModule {}
