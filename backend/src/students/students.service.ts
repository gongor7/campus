import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './student.entity';
import { validateStudentIdentity, StudentIdentityInput } from './identity-validator';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly students: Repository<StudentEntity>,
    private readonly audit: AuditService,
  ) {}

  /**
   * Ingreso/registro por correo sin contrasena (RF-01 a RF-04): el correo
   * existente recupera el registro y conserva el nombre original (B2).
   */
  async session(input: StudentIdentityInput): Promise<StudentEntity> {
    const validation = validateStudentIdentity(input);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors);
    }
    const { name, email } = validation.normalized!;

    const existing = await this.students.findOne({ where: { email } });
    if (existing) {
      await this.audit.log({ action: 'STUDENT_SESSION', resourceType: 'STUDENT', resourceId: existing.id, detail: { recovered: true } });
      return existing;
    }

    const student = await this.students.save(this.students.create({ name, email }));
    await this.audit.log({ action: 'STUDENT_REGISTERED', resourceType: 'STUDENT', resourceId: student.id, detail: { email } });
    return student;
  }

  async findById(id: string): Promise<StudentEntity> {
    const student = await this.students.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Sesion de estudiante no valida');
    return student;
  }
}
