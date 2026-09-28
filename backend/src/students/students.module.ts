import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './student.entity';

// T1 registra la entidad; el servicio y endpoints de sesion llegan en T2.
@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity])],
})
export class StudentsModule {}
