"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudentIdentity = validateStudentIdentity;
const NAME_MIN = 2;
const NAME_MAX = 120;
const EMAIL_MAX = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateStudentIdentity(input) {
    const errors = [];
    const name = (input?.name ?? '').trim();
    const email = (input?.email ?? '').trim().toLowerCase();
    if (name.length < NAME_MIN) {
        errors.push('El nombre debe tener al menos 2 caracteres.');
    }
    if (name.length > NAME_MAX) {
        errors.push(`El nombre no puede superar ${NAME_MAX} caracteres.`);
    }
    if (!EMAIL_PATTERN.test(email)) {
        errors.push('El correo no tiene un formato valido.');
    }
    if (email.length > EMAIL_MAX) {
        errors.push(`El correo no puede superar ${EMAIL_MAX} caracteres.`);
    }
    return {
        valid: errors.length === 0,
        errors,
        normalized: errors.length === 0 ? { name, email } : null,
    };
}
