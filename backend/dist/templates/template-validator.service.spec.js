"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template_validator_service_1 = require("./template-validator.service");
const templates_service_1 = require("./templates.service");
const template = ({ sections }) => ({ id: 1, code: 'ASFI_STANDARD', name: '', sections, isActive: true });
describe('TemplateValidatorService', () => {
    const validator = new template_validator_service_1.TemplateValidatorService(new templates_service_1.TemplatesService(null));
    const validOutline = {
        modules: [
            { title: 'Modulo 1', lessons: [{ title: 'L1' }, { title: 'L2' }] },
            { title: 'Modulo 2', lessons: [{ title: 'L1' }, { title: 'L2' }] },
        ],
        sections: [
            { type: 'INTRODUCTION' },
            { type: 'MODULES' },
            { type: 'PRACTICE' },
            { type: 'EVALUATION' },
            { type: 'CLOSING' },
        ],
    };
    it('acepta una estructura que cumple la plantilla', () => {
        const t = template({
            sections: [
                { type: 'INTRODUCTION', required: true },
                { type: 'MODULES', required: true, minModules: 2, maxModules: 8, minLessonsPerModule: 2, maxLessonsPerModule: 6 },
                { type: 'PRACTICE', required: true },
                { type: 'EVALUATION', required: true },
                { type: 'CLOSING', required: true },
            ],
        });
        expect(validator.validate(validOutline, t)).toEqual([]);
    });
    it('rechaza menos modulos que el minimo', () => {
        const t = template({ sections: [{ type: 'MODULES', required: true, minModules: 2 }] });
        const errors = validator.validate({ modules: [{ title: 'Unico', lessons: [] }], sections: [] }, t);
        expect(errors.some((e) => e.includes('al menos 2 modulos'))).toBe(true);
    });
    it('rechaza modulos con menos lecciones que el minimo', () => {
        const t = template({ sections: [{ type: 'MODULES', required: true, minLessonsPerModule: 2 }] });
        const errors = validator.validate({
            modules: [
                { title: 'M1', lessons: [{ title: 'sola' }] },
                { title: 'M2', lessons: [{ title: 'sola' }] },
            ],
            sections: [],
        }, t);
        expect(errors.length).toBe(2);
    });
    it('rechaza cuando falta una seccion requerida', () => {
        const t = template({ sections: [{ type: 'INTRODUCTION', required: true }, { type: 'CLOSING', required: true }] });
        const errors = validator.validate({ modules: [], sections: [{ type: 'INTRODUCTION' }] }, t);
        expect(errors.some((e) => e.includes('CLOSING'))).toBe(true);
    });
});
