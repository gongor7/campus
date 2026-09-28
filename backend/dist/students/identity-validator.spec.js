"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identity_validator_1 = require("./identity-validator");
describe('validateStudentIdentity', () => {
    it('acepta nombre y correo validos', () => {
        const result = (0, identity_validator_1.validateStudentIdentity)({ name: 'Maria Paz', email: 'maria.paz@asfi.gob.bo' });
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });
    it('acepta nombre con acentos y correo con etiqueta', () => {
        const result = (0, identity_validator_1.validateStudentIdentity)({ name: 'José Núñez', email: 'jose+campus@gmail.com' });
        expect(result.valid).toBe(true);
    });
    it('rechaza nombre de un caracter', () => {
        const result = (0, identity_validator_1.validateStudentIdentity)({ name: 'J', email: 'j@asfi.gob.bo' });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('nombre'))).toBe(true);
    });
    it('rechaza nombre vacio o de solo espacios', () => {
        expect((0, identity_validator_1.validateStudentIdentity)({ name: '   ', email: 'a@b.com' }).valid).toBe(false);
        expect((0, identity_validator_1.validateStudentIdentity)({ name: '', email: 'a@b.com' }).valid).toBe(false);
    });
    it('rechaza correos sin arroba, sin dominio o con espacios', () => {
        expect((0, identity_validator_1.validateStudentIdentity)({ name: 'Ana Vargas', email: 'ana.asfi.gob.bo' }).valid).toBe(false);
        expect((0, identity_validator_1.validateStudentIdentity)({ name: 'Ana Vargas', email: 'ana@asfi' }).valid).toBe(false);
        expect((0, identity_validator_1.validateStudentIdentity)({ name: 'Ana Vargas', email: 'ana vargas@asfi.gob.bo' }).valid).toBe(false);
        expect((0, identity_validator_1.validateStudentIdentity)({ name: 'Ana Vargas', email: '' }).valid).toBe(false);
    });
    it('recorta espacios alrededor del nombre y del correo antes de validar', () => {
        const result = (0, identity_validator_1.validateStudentIdentity)({ name: '  Raul Quizpe  ', email: '  raulq@example.com ' });
        expect(result.valid).toBe(true);
        expect(result.normalized).toEqual({ name: 'Raul Quizpe', email: 'raulq@example.com' });
    });
    it('rechaza longitudes fuera de los limites de la entidad', () => {
        expect((0, identity_validator_1.validateStudentIdentity)({ name: 'x'.repeat(121), email: 'a@b.com' }).valid).toBe(false);
        expect((0, identity_validator_1.validateStudentIdentity)({ name: 'Nombre Largo', email: `${'x'.repeat(200)}@b.com` }).valid).toBe(false);
    });
});
