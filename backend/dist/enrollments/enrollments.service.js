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
exports.EnrollmentsService = exports.EVALUATION_PASS_SCORE = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const lesson_progress_entity_1 = require("./lesson-progress.entity");
const lesson_entity_1 = require("../courses/lesson.entity");
const courses_service_1 = require("../courses/courses.service");
const audit_service_1 = require("../audit/audit.service");
exports.EVALUATION_PASS_SCORE = 70;
let EnrollmentsService = class EnrollmentsService {
    constructor(enrollments, progress, lessons, courses, audit) {
        this.enrollments = enrollments;
        this.progress = progress;
        this.lessons = lessons;
        this.courses = courses;
        this.audit = audit;
    }
    async enroll(studentId, courseId) {
        const course = await this.courses.findById(courseId);
        if (course.status !== 'PUBLISHED') {
            throw new common_1.NotFoundException('El curso no existe');
        }
        const existing = await this.enrollments.findOne({ where: { studentId, courseId } });
        if (existing)
            return existing;
        const enrollment = await this.enrollments.save(this.enrollments.create({ studentId, courseId }));
        await this.audit.log({ action: 'STUDENT_ENROLLED', resourceType: 'ENROLLMENT', resourceId: enrollment.id, detail: { studentId, courseId } });
        return enrollment;
    }
    async myCourses(studentId) {
        const list = await this.enrollments.find({
            where: { studentId },
            relations: { course: true },
            order: { updatedAt: 'DESC' },
        });
        const result = [];
        for (const enrollment of list) {
            const progress = await this.progressOf(enrollment);
            result.push({
                enrollmentId: enrollment.id,
                courseId: enrollment.courseId,
                title: enrollment.course.title,
                level: enrollment.course.level,
                targetHours: enrollment.course.targetHours,
                courseStatus: enrollment.course.status,
                status: enrollment.status,
                bestScore: enrollment.bestScore,
                evaluationApproved: (enrollment.bestScore ?? 0) >= exports.EVALUATION_PASS_SCORE,
                completedLessons: progress.completed,
                totalLessons: progress.total,
                percent: progress.percent,
            });
        }
        return result;
    }
    async courseForStudent(studentId, courseId) {
        const enrollment = await this.enrollments.findOne({ where: { studentId, courseId } });
        const course = await this.courses.findById(courseId);
        if (!enrollment && course.status !== 'PUBLISHED') {
            throw new common_1.NotFoundException('El curso no existe');
        }
        const progress = await this.progressOf(enrollment ?? { id: -1 });
        const marked = enrollment ? await this.markedLessonIds(enrollment.id) : [];
        return {
            course,
            enrollment: enrollment
                ? {
                    id: enrollment.id,
                    status: enrollment.status,
                    bestScore: enrollment.bestScore,
                    evaluationApproved: (enrollment.bestScore ?? 0) >= exports.EVALUATION_PASS_SCORE,
                    completedAt: enrollment.completedAt,
                }
                : null,
            progress,
            markedLessonIds: marked,
        };
    }
    async setProgress(studentId, lessonId, completed) {
        const lesson = await this.lessons.findOne({ where: { id: lessonId } });
        if (!lesson)
            throw new common_1.NotFoundException('Leccion no encontrada');
        const enrollment = await this.enrollments.findOne({ where: { studentId, courseId: lesson.courseId } });
        if (!enrollment)
            throw new common_1.BadRequestException('No estas inscrito a este curso');
        if (enrollment.status === 'COMPLETED')
            throw new common_1.BadRequestException('El curso ya esta completado');
        const existing = await this.progress.findOne({ where: { enrollmentId: enrollment.id, lessonId } });
        if (completed && !existing) {
            await this.progress.save(this.progress.create({ enrollmentId: enrollment.id, lessonId }));
        }
        else if (!completed && existing) {
            await this.progress.delete({ id: existing.id });
        }
        await this.completeIfEligible(enrollment);
        return this.progressOf(enrollment);
    }
    async findEnrollment(studentId, courseId) {
        const enrollment = await this.enrollments.findOne({ where: { studentId, courseId } });
        if (!enrollment)
            throw new common_1.BadRequestException('No estas inscrito a este curso');
        return enrollment;
    }
    async progressOf(enrollment) {
        const total = await this.lessons.count({ where: { courseId: enrollment.courseId } });
        const completed = enrollment.id > 0
            ? await this.progress.count({ where: { enrollmentId: enrollment.id } })
            : 0;
        return {
            completed,
            total,
            percent: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
    }
    async markedLessonIds(enrollmentId) {
        const rows = await this.progress.find({ where: { enrollmentId }, select: ['lessonId'] });
        return rows.map((r) => r.lessonId);
    }
    evaluateCompletion(enrollment, progress) {
        const allLessons = progress.total > 0 && progress.completed >= progress.total;
        const approved = (enrollment.bestScore ?? 0) >= exports.EVALUATION_PASS_SCORE;
        return allLessons && approved;
    }
    async completeIfEligible(enrollment) {
        const fresh = await this.enrollments.findOneOrFail({ where: { id: enrollment.id } });
        const progress = await this.progressOf(fresh);
        if (fresh.status === 'COMPLETED' || !this.evaluateCompletion(fresh, progress))
            return false;
        fresh.status = 'COMPLETED';
        fresh.completedAt = new Date();
        await this.enrollments.save(fresh);
        await this.audit.log({ action: 'COURSE_COMPLETED', resourceType: 'ENROLLMENT', resourceId: fresh.id, detail: { studentId: fresh.studentId, courseId: fresh.courseId, bestScore: fresh.bestScore } });
        return true;
    }
    async catalog() {
        const all = await this.courses.findAll();
        return all.filter((c) => c.status === 'PUBLISHED');
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(enrollment_entity_1.EnrollmentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(lesson_progress_entity_1.LessonProgressEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(lesson_entity_1.LessonEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        courses_service_1.CoursesService,
        audit_service_1.AuditService])
], EnrollmentsService);
