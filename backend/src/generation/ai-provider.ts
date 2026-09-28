import { StoredFile } from '../sources/storage.service';
import { TemplateSection } from '../templates/template.entity';

export interface CourseContext {
  title: string;
  description: string;
  objective: string;
  audience: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  targetHours: number;
}

export interface OutlineInput {
  course: CourseContext;
  templateSections: TemplateSection[];
  sources: StoredFile[];
}

export interface OutlineProposal {
  modules: {
    title: string;
    objective: string;
    estimatedMinutes: number;
    sourceRefs: string[];
    lessons: { title: string; objective: string; estimatedMinutes: number }[];
  }[];
  sections: { type: 'INTRODUCTION' | 'PRACTICE' | 'EVALUATION' | 'CLOSING'; title: string; content: string }[];
  totalEstimatedMinutes: number;
  coverageGaps: { topic: string; reason: string }[];
}

export interface LessonInput {
  course: CourseContext;
  moduleTitle: string;
  moduleObjective: string;
  lessonTitle: string;
  sources: StoredFile[];
}

export interface LessonContent {
  objective: string;
  content: string;
  sourceRefs: string[];
}

/**
 * Abstraccion del proveedor de IA (SPEC-ai-generation). El dominio depende
 * solo de esta interfaz; Gemini, NotebookLM u otro proveedor se implementan
 * aparte y se seleccionan por configuracion (AI_PROVIDER).
 */
export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generateOutline(input: OutlineInput): Promise<OutlineProposal>;
  generateLessonContent(input: LessonInput): Promise<LessonContent>;
}
