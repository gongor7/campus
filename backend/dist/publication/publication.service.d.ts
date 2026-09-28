import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/course.entity';
import { AuditService } from '../audit/audit.service';
import { QuestionBanksService } from '../question-banks/question-banks.service';
import { SourcesService } from '../sources/sources.service';
export declare class PublicationService {
    private readonly courses;
    private readonly audit;
    private readonly banks;
    private readonly sources;
    constructor(courses: Repository<CourseEntity>, audit: AuditService, banks: QuestionBanksService, sources: SourcesService);
    submitReview(courseId: number): Promise<CourseEntity>;
    publish(courseId: number): Promise<CourseEntity>;
    private completenessProblems;
    private load;
    private reload;
}
