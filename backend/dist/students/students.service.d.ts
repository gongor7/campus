import { Repository } from 'typeorm';
import { StudentEntity } from './student.entity';
import { StudentIdentityInput } from './identity-validator';
import { AuditService } from '../audit/audit.service';
export declare class StudentsService {
    private readonly students;
    private readonly audit;
    constructor(students: Repository<StudentEntity>, audit: AuditService);
    session(input: StudentIdentityInput): Promise<StudentEntity>;
    findById(id: string): Promise<StudentEntity>;
}
