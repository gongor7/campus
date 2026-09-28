import { describe, expect, it } from 'vitest';
import { STATUS_LABELS, statusClass, formatHours, formatBytes } from '../src/helpers';

describe('helpers', () => {
  it('mapea estados del curso a etiquetas y clases visuales', () => {
    expect(STATUS_LABELS.DRAFT).toBe('Borrador');
    expect(statusClass('PUBLISHED')).toBe('chip-published');
    expect(statusClass('REVIEW')).toBe('chip-review');
    expect(statusClass('DRAFT')).toBe('chip-draft');
    expect(statusClass('ARCHIVED')).toBe('chip-archived');
  });

  it('formatea minutos en horas legibles', () => {
    expect(formatHours(45)).toBe('45 min');
    expect(formatHours(120)).toBe('2 h');
    expect(formatHours(135)).toBe('2 h 15 min');
  });

  it('formatea tamaños de archivo', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
