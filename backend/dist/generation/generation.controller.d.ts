import { GenerationService } from './generation.service';
export declare class GenerationController {
    private readonly generation;
    constructor(generation: GenerationService);
    generateOutline(id: number): Promise<import("./ai-provider").OutlineProposal>;
    generateLesson(lessonId: number): Promise<import("./ai-provider").LessonContent>;
    listByCourse(id: number): Promise<import("./course-generation.entity").CourseGenerationEntity[]>;
}
