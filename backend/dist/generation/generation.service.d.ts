import { Repository } from 'typeorm';
import { CourseGenerationEntity } from './course-generation.entity';
import { LessonContent, OutlineProposal } from './ai-provider';
import { CoursesService } from '../courses/courses.service';
import { SourcesService } from '../sources/sources.service';
import { StorageService } from '../sources/storage.service';
import { TemplatesService } from '../templates/templates.service';
import { TemplateValidatorService } from '../templates/template-validator.service';
import { AuditService } from '../audit/audit.service';
import { LessonEntity } from '../courses/lesson.entity';
import { AiProviderService } from './ai-provider.service';
export declare class GenerationService {
    private readonly generations;
    private readonly lessonsRepo;
    private readonly courses;
    private readonly sources;
    private readonly storage;
    private readonly templates;
    private readonly validator;
    private readonly audit;
    private readonly ai;
    constructor(generations: Repository<CourseGenerationEntity>, lessonsRepo: Repository<LessonEntity>, courses: CoursesService, sources: SourcesService, storage: StorageService, templates: TemplatesService, validator: TemplateValidatorService, audit: AuditService, ai: AiProviderService);
    generateOutline(courseId: number): Promise<OutlineProposal>;
    generateLesson(lessonId: number): Promise<LessonContent>;
    listByCourse(courseId: number): Promise<CourseGenerationEntity[]>;
    private courseContext;
    private proposalToDto;
    private trace;
}
