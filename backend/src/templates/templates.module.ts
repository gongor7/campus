import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from './template.entity';
import { TemplatesService } from './templates.service';
import { TemplateValidatorService } from './template-validator.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateEntity])],
  providers: [TemplatesService, TemplateValidatorService],
  controllers: [TemplatesController],
  exports: [TemplatesService, TemplateValidatorService],
})
export class TemplatesModule {}
