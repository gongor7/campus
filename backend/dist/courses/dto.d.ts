export declare class CreateCourseDto {
    title: string;
    description?: string;
    objective?: string;
    audience?: string;
    level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    targetHours: number;
    templateId?: number;
    sourceSetId?: number | null;
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    objective?: string;
    audience?: string;
    level?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    targetHours?: number;
    sourceSetId?: number | null;
}
export declare class OutlineLessonDto {
    title: string;
    objective?: string;
    estimatedMinutes: number;
    sourceRefs?: string[];
}
export declare class OutlineModuleDto {
    title: string;
    objective?: string;
    estimatedMinutes: number;
    lessons: OutlineLessonDto[];
    sourceRefs?: string[];
}
export declare class OutlineSectionDto {
    type: 'INTRODUCTION' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';
    title: string;
    content?: string;
}
export declare class ReplaceOutlineDto {
    modules: OutlineModuleDto[];
    sections: OutlineSectionDto[];
}
export declare class UpdateLessonDto {
    title?: string;
    objective?: string;
    content?: string;
    estimatedMinutes?: number;
    sourceRefs?: string[];
}
export declare class UpdateSectionDto {
    title?: string;
    content?: string;
}
