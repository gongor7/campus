"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attempt_entity_1 = require("./attempt.entity");
const attempt_question_entity_1 = require("./attempt-question.entity");
const cooldown_1 = require("./cooldown");
const enrollment_entity_1 = require("../enrollments/enrollment.entity");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const question_banks_service_1 = require("../question-banks/question-banks.service");
const courses_service_1 = require("../courses/courses.service");
const ai_provider_service_1 = require("../generation/ai-provider.service");
const audit_service_1 = require("../audit/audit.service");
const QUESTIONS_PER_ATTEMPT = 5;
const GRADING_RETRIES = 2;
let AttemptsService = class AttemptsService {
    constructor(attempts, attemptQuestions, enrollmentRepo, enrollments, banks, courses, ai, audit, config) {
        this.attempts = attempts;
        this.attemptQuestions = attemptQuestions;
        this.enrollmentRepo = enrollmentRepo;
        this.enrollments = enrollments;
        this.banks = banks;
        this.courses = courses;
        this.ai = ai;
        this.audit = audit;
        const raw = Number(config.get('ATTEMPT_COOLDOWN_MINUTES', '10'));
        this.cooldownMinutes = Number.isFinite(raw) ? raw : 10;
    }
    async start(studentId, courseId) {
        const enrollment = await this.enrollments.findEnrollment(studentId, courseId);
        const course = await this.courses.findById(courseId);
        if (course.status !== 'PUBLISHED' && course.status !== 'ARCHIVED') {
            throw new common_1.BadRequestException('El curso no esta disponible');
        }
        if (enrollment.status === 'COMPLETED') {
            throw new common_1.BadRequestException('El curso ya esta completado');
        }
        const remaining = await this.remainingCooldownMs(studentId, courseId);
        if (remaining > 0) {
            const minutes = Math.ceil(remaining / 60000);
            throw new common_1.BadRequestException(`Debes esperar el enfriamiento entre intentos: aproximadamente ${minutes} minuto(s).`);
        }
        const questions = await this.banks.approvedBankWithQuestions(courseId);
        if (questions.length === 0) {
            throw new common_1.BadRequestException('El curso no tiene banco de preguntas aprobado');
        }
        const selected = questions.slice(0, QUESTIONS_PER_ATTEMPT);
        const attempt = await this.attempts.save(this.attempts.create({ enrollmentId: enrollment.id, courseId, status: 'PREPARING' }));
        let variants;
        try {
            const result = await this.ai.provider.generateVariants({
                seed: attempt.id,
                questions: selected.map((q) => ({
                    id: q.id,
                    caseText: q.caseText,
                    prompt: q.prompt,
                    variationTemplate: q.variationTemplate,
                })),
            });
            variants = result.variants;
        }
        catch (error) {
            await this.setStatus(attempt, 'GRADING_FAILED');
            await this.audit.log({
                action: 'ATTEMPT_START_FAILED',
                resourceType: 'ENROLLMENT',
                resourceId: enrollment.id,
                result: 'ERROR',
                detail: { message: error.message },
            });
            throw new common_1.BadRequestException('No se pudo preparar la evaluacion; el intento no tiene efecto. Intenta nuevamente.');
        }
        for (const question of selected) {
            const variant = variants.find((v) => v.questionId === question.id);
            await this.attemptQuestions.save(this.attemptQuestions.create({
                attemptId: attempt.id,
                questionId: question.id,
                variantCase: variant?.caseText ?? question.caseText,
            }));
        }
        await this.setStatus(attempt, 'IN_PROGRESS');
        await this.audit.log({ action: 'ATTEMPT_STARTED', resourceType: 'ENROLLMENT', resourceId: enrollment.id, detail: { attemptId: attempt.id } });
        return this.getAttempt(attempt.id, studentId);
    }
    async submit(studentId, attemptId, answers) {
        const attempt = await this.loadOwned(attemptId, studentId);
        if (attempt.status === 'GRADED') {
            return this.getAttempt(attemptId, studentId);
        }
        if (attempt.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException(`El intento no admite envio en estado ${attempt.status}`);
        }
        const rows = await this.attemptQuestions.find({ where: { attemptId }, relations: { question: true } });
        for (const row of rows) {
            const provided = answers.find((a) => a.questionId === row.questionId);
            row.answer = provided?.answer?.trim() ?? '';
        }
        await this.attemptQuestions.save(rows);
        attempt.submittedAt = new Date();
        await this.setStatus(attempt, 'GRADING');
        const courseContext = this.courseContext(await this.courses.findById(attempt.courseId));
        try {
            const graded = await this.gradeWithRetry(rows, courseContext);
            for (const row of graded) {
                await this.attemptQuestions.save(row);
            }
            const scores = graded.map((r) => r.score ?? 0);
            const score = scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            attempt.score = score;
            await this.setStatus(attempt, 'GRADED');
            const enrollment = await this.enrollmentRepo.findOneOrFail({ where: { id: attempt.enrollmentId } });
            if (enrollment.bestScore === null || score > enrollment.bestScore) {
                enrollment.bestScore = score;
                await this.enrollmentRepo.save(enrollment);
            }
            await this.audit.log({
                action: 'ATTEMPT_GRADED',
                resourceType: 'ENROLLMENT',
                resourceId: enrollment.id,
                detail: { attemptId, score, approved: score >= enrollments_service_1.EVALUATION_PASS_SCORE },
            });
            await this.enrollments.completeIfEligible(enrollment);
            return this.getAttempt(attemptId, studentId);
        }
        catch (error) {
            await this.setStatus(attempt, 'GRADING_FAILED');
            await this.audit.log({
                action: 'ATTEMPT_GRADING_FAILED',
                resourceType: 'ENROLLMENT',
                resourceId: attempt.enrollmentId,
                result: 'ERROR',
                detail: { attemptId, message: error.message },
            });
            return this.getAttempt(attemptId, studentId);
        }
    }
    async getAttempt(attemptId, studentId) {
        const attempt = await this.loadOwned(attemptId, studentId);
        const rows = await this.attemptQuestions.find({
            where: { attemptId },
            relations: { question: true },
            order: { id: 'ASC' },
        });
        const graded = attempt.status === 'GRADED';
        return {
            id: attempt.id,
            courseId: attempt.courseId,
            status: attempt.status,
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            score: graded ? attempt.score : null,
            passScore: enrollments_service_1.EVALUATION_PASS_SCORE,
            questions: rows.map((r) => ({
                questionId: r.questionId,
                prompt: r.question.prompt,
                variantCase: r.variantCase,
                answer: r.answer,
                score: graded ? r.score : null,
                feedback: graded ? r.feedback : null,
            })),
        };
    }
    async history(studentId, courseId) {
        const enrollment = await this.enrollments.findEnrollment(studentId, courseId);
        const graded = await this.attempts.find({
            where: { enrollmentId: enrollment.id, status: 'GRADED' },
            order: { submittedAt: 'ASC' },
        });
        return graded.map((a) => ({
            id: a.id,
            submittedAt: a.submittedAt,
            score: a.score,
            approved: (a.score ?? 0) >= enrollments_service_1.EVALUATION_PASS_SCORE,
        }));
    }
    async remainingCooldownMs(studentId, courseId) {
        const enrollment = await this.enrollments.findEnrollment(studentId, courseId);
        const last = await this.attempts.findOne({
            where: { enrollmentId: enrollment.id, status: 'GRADED' },
            order: { submittedAt: 'DESC' },
        });
        if (!last?.submittedAt)
            return 0;
        return (0, cooldown_1.cooldownRemainingMs)(last.submittedAt, new Date(), this.cooldownMinutes);
    }
    async gradeWithRetry(rows, courseContext) {
        let lastError;
        for (let i = 0; i <= GRADING_RETRIES; i++) {
            try {
                for (const row of rows) {
                    const result = await this.ai.provider.gradeAnswer({
                        course: courseContext,
                        question: {
                            variantCase: row.variantCase,
                            prompt: row.question.prompt,
                            expectedConcepts: row.question.expectedConcepts,
                            sourceRefs: row.question.sourceRefs,
                        },
                        answer: row.answer ?? '',
                    });
                    row.score = Math.max(0, Math.min(100, Math.round(result.score)));
                    row.feedback = result.feedback;
                }
                return rows;
            }
            catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }
    courseContext(course) {
        return {
            title: course.title,
            description: course.description,
            objective: course.objective,
            audience: course.audience,
            level: course.level,
            targetHours: course.targetHours,
        };
    }
    async loadOwned(attemptId, studentId) {
        const attempt = await this.attempts.findOne({ where: { id: attemptId } });
        if (!attempt)
            throw new common_1.NotFoundException('Intento no encontrado');
        const enrollment = await this.enrollmentRepo.findOneByOrFail({ id: attempt.enrollmentId });
        if (enrollment.studentId !== studentId)
            throw new common_1.NotFoundException('Intento no encontrado');
        return attempt;
    }
    async setStatus(attempt, next) {
        if (!attempt_entity_1.ATTEMPT_TRANSITIONS[attempt.status].includes(next)) {
            throw new common_1.BadRequestException(`Transicion invalida: ${attempt.status} -> ${next}`);
        }
        attempt.status = next;
        await this.attempts.save(attempt);
    }
};
exports.AttemptsService = AttemptsService;
exports.AttemptsService = AttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attempt_entity_1.AttemptEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(attempt_question_entity_1.AttemptQuestionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(enrollment_entity_1.EnrollmentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        enrollments_service_1.EnrollmentsService,
        question_banks_service_1.QuestionBanksService,
        courses_service_1.CoursesService,
        ai_provider_service_1.AiProviderService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], AttemptsService);
