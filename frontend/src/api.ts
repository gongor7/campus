// Unico cliente HTTP de la aplicacion (AGENTS.md). Todas las vistas pasan por aca.

export type CourseLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface Source {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface SourceSet {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  sources: Source[];
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  objective: string | null;
  content: string | null;
  estimatedMinutes: number;
  position: number;
  sourceRefs: string[] | null;
}

export interface CourseModule {
  id: number;
  title: string;
  objective: string | null;
  estimatedMinutes: number;
  position: number;
  lessons: Lesson[];
}

export interface CourseSection {
  id: number;
  type: 'INTRODUCTION' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';
  title: string;
  content: string | null;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  objective: string;
  audience: string;
  level: CourseLevel;
  targetHours: number;
  status: CourseStatus;
  templateId: number;
  sourceSetId: number | null;
  sourceSet: SourceSet | null;
  modules: CourseModule[];
  sections: CourseSection[];
  updatedAt: string;
}

export interface OutlineProposal {
  modules: { title: string; objective: string; estimatedMinutes: number; sourceRefs: string[]; lessons: { title: string; objective: string; estimatedMinutes: number }[] }[];
  sections: { type: string; title: string; content: string }[];
  totalEstimatedMinutes: number;
  coverageGaps: { topic: string; reason: string }[];
}

export interface AuditRow {
  id: number;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: string;
  createdAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: init?.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.message ?? `Error ${res.status}`);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCourses: () => request<Course[]>('/courses'),
  getCourse: (id: number) => request<Course>(`/courses/${id}`),
  createCourse: (data: {
    title: string;
    description?: string;
    objective?: string;
    audience?: string;
    level: CourseLevel;
    targetHours: number;
    sourceSetId?: number;
  }) => request<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),

  generateOutline: (courseId: number) =>
    request<OutlineProposal>(`/courses/${courseId}/generate-outline`, { method: 'POST' }),
  generateLesson: (lessonId: number) =>
    request<{ objective: string; content: string; sourceRefs: string[] }>(`/lessons/${lessonId}/generate-content`, { method: 'POST' }),
  updateLesson: (lessonId: number, data: { title?: string; objective?: string; content?: string; sourceRefs?: string[] }) =>
    request<Lesson>(`/courses/lessons/${lessonId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateSection: (sectionId: number, data: { title?: string; content?: string }) =>
    request<CourseSection>(`/courses/sections/${sectionId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  submitReview: (courseId: number) => request<Course>(`/courses/${courseId}/submit-review`, { method: 'POST' }),
  publish: (courseId: number) => request<Course>(`/courses/${courseId}/publish`, { method: 'POST' }),
  archive: (courseId: number) => request<Course>(`/courses/${courseId}/archive`, { method: 'POST' }),

  listSourceSets: () => request<SourceSet[]>('/source-sets'),
  createSourceSet: (name: string, description?: string) =>
    request<SourceSet>('/source-sets', { method: 'POST', body: JSON.stringify({ name, description }) }),
  uploadSources: (setId: number, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append('files', file);
    return request<Source[]>(`/source-sets/${setId}/sources`, { method: 'POST', body: form });
  },
  deleteSource: (sourceId: number) => request<void>(`/source-sets/sources/${sourceId}`, { method: 'DELETE' }),

  listAudit: (resourceType?: string, resourceId?: string) => {
    const params = new URLSearchParams();
    if (resourceType) params.set('resourceType', resourceType);
    if (resourceId) params.set('resourceId', resourceId);
    const qs = params.toString();
    return request<AuditRow[]>(`/audit${qs ? `?${qs}` : ''}`);
  },
};
