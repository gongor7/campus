"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = void 0;
const common_1 = require("@nestjs/common");
let MockProvider = class MockProvider {
    constructor() {
        this.name = 'mock';
        this.model = 'deterministic-v1';
    }
    async generateOutline(input) {
        const filenames = input.sources.map((s) => s.filename);
        const lessonMinutes = Math.max(10, Math.round((input.course.targetHours * 60) / 9 / 5) * 5);
        const moduleTitles = [
            'Fundamentos del tema',
            'Desarrollo y configuracion',
            'Aplicacion institucional',
        ];
        const modules = moduleTitles.map((title, moduleIndex) => ({
            title: `${title} (${input.course.title})`,
            objective: `Comprender y aplicar los conceptos de ${title.toLowerCase()} del curso.`,
            estimatedMinutes: lessonMinutes * 3,
            sourceRefs: filenames.slice(moduleIndex % Math.max(filenames.length, 1), (moduleIndex % Math.max(filenames.length, 1)) + 1),
            lessons: [1, 2, 3].map((n) => ({
                title: `Leccion ${moduleIndex + 1}.${n}: aspecto ${n} de ${title.toLowerCase()}`,
                objective: `Explicar el aspecto ${n}.`,
                estimatedMinutes: lessonMinutes,
            })),
        }));
        const totalMinutes = modules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
        const coverageGaps = filenames.length === 0
            ? [{ topic: 'Todo el curso', reason: 'El cuaderno vinculado no tiene fuentes cargadas.' }]
            : [];
        return {
            modules,
            sections: [
                { type: 'INTRODUCTION', title: 'Introduccion', content: `Alcance y proposito de ${input.course.title}.` },
                { type: 'PRACTICE', title: 'Practica guiada', content: 'Ejercicio aplicado al contexto institucional.' },
                { type: 'EVALUATION', title: 'Evaluacion', content: 'Examen del curso con criterios de la plantilla.' },
                { type: 'CLOSING', title: 'Cierre', content: 'Sintesis y siguientes pasos.' },
            ],
            totalEstimatedMinutes: totalMinutes,
            coverageGaps,
        };
    }
    async generateLessonContent(input) {
        const filenames = input.sources.map((s) => s.filename);
        return {
            objective: `Al finalizar la leccion, el participante podra aplicar: ${input.lessonTitle}.`,
            content: `Contenido de referencia para "${input.lessonTitle}" dentro del modulo "${input.moduleTitle}". ` +
                `Esta propuesta fue generada en modo simulado (sin IA real): al configurar GEMINI_API_KEY el contenido ` +
                `se genera a partir de las fuentes del cuaderno: ${filenames.join(', ') || 'sin fuentes'}.`,
            sourceRefs: filenames.slice(0, 2),
        };
    }
    async generateQuestionBank(input) {
        const lessons = input.lessons.length > 0 ? input.lessons : [{ title: 'Conceptos del curso', content: null, sourceRefs: null }];
        const questions = [];
        for (let i = 0; i < Math.max(6, Math.min(lessons.length, 8)); i++) {
            const lesson = lessons[i % lessons.length];
            const sourceRefs = (lesson.sourceRefs ?? input.sources.map((s) => s.filename)).slice(0, 2);
            questions.push({
                caseText: `Caso institucional: en una entidad del sistema financiero supervisada por la ASFI se presenta una ` +
                    `situacion relacionada con ${lesson.title.toLowerCase()}. El estudiante debe analizar el caso concreto ` +
                    `y fundamentar su respuesta en el material oficial del curso.`,
                prompt: `Analiza el caso y explica como se aplica ${lesson.title}, citando el sustento del material del curso.`,
                expectedConcepts: [lesson.title, 'material del curso', 'aplicacion'],
                sourceRefs: sourceRefs.length > 0 ? sourceRefs : ['material del curso'],
                variationTemplate: {
                    variableAspects: ['entidad', 'monto', 'plazo', 'situacion'],
                    constraints: 'El concepto evaluado y el nivel de dificultad se mantienen identicos.',
                },
            });
        }
        return { questions };
    }
    async generateVariants(input) {
        return {
            variants: input.questions.map((q) => ({
                questionId: q.id,
                caseText: `${q.caseText} [Variante ${input.seed.slice(0, 8)}: entidad, monto y plazo ajustados dentro de la plantilla aprobada]`,
            })),
        };
    }
    async gradeAnswer(input) {
        const answer = (input.answer ?? '').trim();
        if (answer.includes('[FALLA_PROVEEDOR]')) {
            throw new Error('proveedor de IA no disponible (simulado)');
        }
        if (answer.length === 0) {
            return { score: 0, sustained: false, feedback: 'La respuesta esta vacia. Desarrolla tu analisis del caso.' };
        }
        const reference = input.question.sourceRefs[0] ?? 'material del curso';
        const genericMarker = answer.includes('[GENERICA]');
        if (genericMarker) {
            return {
                score: 40,
                sustained: false,
                feedback: 'La respuesta es correcta en terminos generales pero no se sustenta en el material del curso, ' +
                    `por lo que su puntaje queda por debajo del minimo de sustento. Referencia para profundizar: ${reference}.`,
            };
        }
        const concepts = input.question.expectedConcepts;
        const matched = concepts.filter((c) => answer.toLowerCase().includes(c.toLowerCase()));
        const half = Math.ceil(concepts.length / 2);
        const sustained = matched.length >= half;
        let score;
        if (matched.length === concepts.length)
            score = 100;
        else if (sustained)
            score = 80;
        else if (matched.length > 0)
            score = 55;
        else
            score = 25;
        const missing = concepts.filter((c) => !matched.includes(c));
        const feedback = `Conceptos cubiertos: ${matched.length === 0 ? 'ninguno' : matched.join(', ')}. ` +
            (missing.length > 0 ? `Conceptos faltantes: ${missing.join(', ')}. ` : '') +
            `Referencia del curso que desarrolla la respuesta: ${reference}.`;
        return { score, sustained, feedback };
    }
};
exports.MockProvider = MockProvider;
exports.MockProvider = MockProvider = __decorate([
    (0, common_1.Injectable)()
], MockProvider);
