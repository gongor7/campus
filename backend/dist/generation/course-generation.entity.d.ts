export type GenerationPhase = 'OUTLINE' | 'LESSON';
export type GenerationStatus = 'SUCCESS' | 'ERROR';
export declare class CourseGenerationEntity {
    id: number;
    courseId: number;
    phase: GenerationPhase;
    lessonId: number | null;
    provider: string;
    model: string;
    actor: string;
    status: GenerationStatus;
    durationMs: number;
    inputSummary: Record<string, unknown> | null;
    message: string | null;
    createdAt: Date;
}
