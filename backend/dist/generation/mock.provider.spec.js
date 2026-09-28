"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock_provider_1 = require("./mock.provider");
describe('MockProvider', () => {
    const provider = new mock_provider_1.MockProvider();
    const course = {
        title: 'Keycloak para ASFI',
        description: '',
        objective: '',
        audience: 'equipo plataforma',
        level: 'BASIC',
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
        expect(proposal.sections.map((s) => s.type)).toEqual(expect.arrayContaining(['INTRODUCTION', 'PRACTICE', 'EVALUATION', 'CLOSING']));
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
    it('genera un banco con preguntas de caso, conceptos y plantilla de variacion', async () => {
        const bank = await provider.generateQuestionBank({
            course,
            lessons: [{ title: 'Gestion de riesgos', content: 'contenido', sourceRefs: ['manual.pdf'] }],
            sources: [{ filename: 'manual.pdf', mimeType: 'application/pdf', base64: '' }],
        });
        expect(bank.questions.length).toBeGreaterThanOrEqual(5);
        for (const q of bank.questions) {
            expect(q.caseText.length).toBeGreaterThan(20);
            expect(q.prompt.length).toBeGreaterThan(10);
            expect(q.expectedConcepts.length).toBeGreaterThanOrEqual(2);
            expect(q.variationTemplate.variableAspects.length).toBeGreaterThan(0);
        }
    });
    it('genera variantes distintas por semilla para la misma pregunta', async () => {
        const base = { id: 1, caseText: 'Caso base', prompt: 'Analiza', variationTemplate: { variableAspects: ['entidad'], constraints: 'igual' } };
        const v1 = await provider.generateVariants({ seed: 'aaaaaaaa-1111', questions: [base] });
        const v2 = await provider.generateVariants({ seed: 'bbbbbbbb-2222', questions: [base] });
        expect(v1.variants[0].caseText).not.toBe(v2.variants[0].caseText);
        expect(v1.variants[0].caseText).toContain('Caso base');
    });
    it('califica: vacia en 0, todos los conceptos en 100, sin sustento por debajo de 50', async () => {
        const question = { variantCase: 'Caso', prompt: 'P', expectedConcepts: ['riesgo', 'supervision'], sourceRefs: ['manual.pdf'] };
        const ctx = { course };
        const vacia = await provider.gradeAnswer({ course: ctx, question, answer: '   ' });
        expect(vacia.score).toBe(0);
        const completa = await provider.gradeAnswer({ course: ctx, question, answer: 'Aplico el riesgo y la supervision del manual.' });
        expect(completa.score).toBe(100);
        expect(completa.sustained).toBe(true);
        const generica = await provider.gradeAnswer({ course: ctx, question, answer: 'Respuesta correcta pero [GENERICA]' });
        expect(generica.score).toBeLessThanOrEqual(50);
        expect(generica.sustained).toBe(false);
        expect(generica.feedback).toContain('material del curso');
    });
    it('el disparador de fallo del proveedor lanza error (RF-25)', async () => {
        const question = { variantCase: 'Caso', prompt: 'P', expectedConcepts: ['x'], sourceRefs: ['a.pdf'] };
        await expect(provider.gradeAnswer({ course: {}, question, answer: 'mi respuesta [FALLA_PROVEEDOR]' })).rejects.toThrow('proveedor');
    });
});
