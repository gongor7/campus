import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/course.entity';
import { AuditService } from '../audit/audit.service';
export declare class PublicationService {
    private readonly courses;
    private readonly audit;
    constructor(courses: Repository<CourseEntity>, audit: AuditService);
    submitReview(courseId: number): Promise<CourseEntity>;
    publish(courseId: number): Promise<CourseEntity>;
    private completenessProblems;
    private load;
    private reload;
}
