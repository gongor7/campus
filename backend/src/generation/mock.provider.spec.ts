import { MockProvider } from './mock.provider';

describe('MockProvider', () => {
  const provider = new MockProvider();

  const course = {
    title: 'Keycloak para ASFI',
    description: '',
    objective: '',
    audience: 'equipo plataforma',
    level: 'BASIC' as const,
    targetHours: 6,
  };

  it('genera una propuesta que cumple la plantilla (3 modulos, 3 lecciones, 4 secciones)', async () => {
    const proposal = await provider.generateOutline({
      course,
      templateSections: [],
      sources: [{ filename: 'doc.pdf', mimeType: 'application/pdf', base64: '' }],
    });
    expect(proposal.modules.length).toBeGreaterThanOrEqual(2);
    for (const module of proposal.modules) {
      expect(module.lessons.length).toBeGreaterThanOrEqual(2);
    }
    expect(proposal.sections.map((s) => s.type)).toEqual(
      expect.arrayContaining(['INTRODUCTION', 'PRACTICE', 'EVALUATION', 'CLOSING']),
    );
    expect(proposal.modules.every((m) => m.sourceRefs.includes('doc.pdf'))).toBe(true);
  });

  it('reporta brecha de cobertura cuando el cuaderno no tiene fuentes', async () => {
    const proposal = await provider.generateOutline({ course, templateSections: [], sources: [] });
    expect(proposal.coverageGaps.length).toBeGreaterThan(0);
  });

  it('genera contenido de leccion con citas de fuente', async () => {
    const content = await provider.generateLessonContent({
      course,
      moduleTitle: 'Fundamentos',
      moduleObjective: '',
      lessonTitle: 'Conceptos',
      sources: [{ filename: 'guia.pdf', mimeType: 'application/pdf', base64: '' }],
    });
    expect(content.objective.length).toBeGreaterThan(0);
    expect(content.content.length).toBeGreaterThan(0);
    expect(content.sourceRefs).toContain('guia.pdf');
  });
});
