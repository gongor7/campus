import { StudentsService } from './students.service';
declare class SessionDto {
    name: string;
    email: string;
}
export declare class StudentsController {
    private readonly students;
    constructor(students: StudentsService);
    session(dto: SessionDto): Promise<import("./student.entity").StudentEntity>;
}
export {};
