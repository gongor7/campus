import { validateStudentIdentity } from './identity-validator';

// T1 — RF-01 y RF-04: registro con nombre (>= 2 caracteres) y correo valido,
// rechazo con mensaje claro y sin efectos cuando el formato no cumple.
describe('validateStudentIdentity', () => {
  it('acepta nombre y correo validos', () => {
    const result = validateStudentIdentity({ name: 'Maria Paz', email: 'maria.paz@asfi.gob.bo' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('acepta nombre con acentos y correo con etiqueta', () => {
    const result = validateStudentIdentity({ name: 'José Núñez', email: 'jose+campus@gmail.com' });
    expect(result.valid).toBe(true);
  });

  it('rechaza nombre de un caracter', () => {
    const result = validateStudentIdentity({ name: 'J', email: 'j@asfi.gob.bo' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('nombre'))).toBe(true);
  });

  it('rechaza nombre vacio o de solo espacios', () => {
    expect(validateStudentIdentity({ name: '   ', email: 'a@b.com' }).valid).toBe(false);
    expect(validateStudentIdentity({ name: '', email: 'a@b.com' }).valid).toBe(false);
  });

  it('rechaza correos sin arroba, sin dominio o con espacios', () => {
    expect(validateStudentIdentity({ name: 'Ana Vargas', email: 'ana.asfi.gob.bo' }).valid).toBe(false);
    expect(validateStudentIdentity({ name: 'Ana Vargas', email: 'ana@asfi' }).valid).toBe(false);
    expect(validateStudentIdentity({ name: 'Ana Vargas', email: 'ana vargas@asfi.gob.bo' }).valid).toBe(false);
    expect(validateStudentIdentity({ name: 'Ana Vargas', email: '' }).valid).toBe(false);
  });

  it('recorta espacios alrededor del nombre y del correo antes de validar', () => {
    const result = validateStudentIdentity({ name: '  Raul Quizpe  ', email: '  raulq@example.com ' });
    expect(result.valid).toBe(true);
    expect(result.normalized).toEqual({ name: 'Raul Quizpe', email: 'raulq@example.com' });
  });

  it('rechaza longitudes fuera de los limites de la entidad', () => {
    expect(validateStudentIdentity({ name: 'x'.repeat(121), email: 'a@b.com' }).valid).toBe(false);
    expect(validateStudentIdentity({ name: 'Nombre Largo', email: `${'x'.repeat(200)}@b.com` }).valid).toBe(false);
  });
});
