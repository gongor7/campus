import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './student.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity]), AuditModule],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
