export interface StudentIdentityInput {
    name: string;
    email: string;
}
export interface StudentIdentity {
    name: string;
    email: string;
}
export interface IdentityValidation {
    valid: boolean;
    errors: string[];
    normalized: StudentIdentity | null;
}
export declare function validateStudentIdentity(input: StudentIdentityInput): IdentityValidation;
