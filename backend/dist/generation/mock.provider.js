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
};
exports.MockProvider = MockProvider;
exports.MockProvider = MockProvider = __decorate([
    (0, common_1.Injectable)()
], MockProvider);
