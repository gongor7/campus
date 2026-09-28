import type { CourseStatus } from './api';

export const STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: 'Borrador',
  REVIEW: 'En revision',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

export function statusClass(status: CourseStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'chip-published';
    case 'REVIEW':
      return 'chip-review';
    case 'ARCHIVED':
      return 'chip-archived';
    default:
      return 'chip-draft';
  }
}

export const LEVEL_LABELS: Record<string, string> = {
  BASIC: 'Basico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

export function formatHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
