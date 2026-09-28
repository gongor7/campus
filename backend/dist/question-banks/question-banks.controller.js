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
exports.QuestionBanksController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const question_banks_service_1 = require("./question-banks.service");
class QuestionDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], QuestionDto.prototype, "caseText", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], QuestionDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QuestionDto.prototype, "expectedConcepts", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QuestionDto.prototype, "sourceRefs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], QuestionDto.prototype, "variationTemplate", void 0);
class UpdateQuestionDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "caseText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateQuestionDto.prototype, "expectedConcepts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateQuestionDto.prototype, "sourceRefs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateQuestionDto.prototype, "variationTemplate", void 0);
let QuestionBanksController = class QuestionBanksController {
    constructor(banks) {
        this.banks = banks;
    }
    generate(id) {
        return this.banks.generate(id);
    }
    findByCourse(id) {
        return this.banks.findByCourse(id);
    }
    addQuestion(id, dto) {
        return this.banks.addQuestion(id, dto);
    }
    updateQuestion(questionId, dto) {
        return this.banks.updateQuestion(questionId, dto);
    }
    deleteQuestion(questionId) {
        return this.banks.deleteQuestion(questionId);
    }
    approve(id) {
        return this.banks.approve(id);
    }
};
exports.QuestionBanksController = QuestionBanksController;
__decorate([
    (0, common_1.Post)(':id/questions/generate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(':id/questions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Post)(':id/questions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, QuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "addQuestion", null);
__decorate([
    (0, common_1.Patch)('questions/:questionId'),
    __param(0, (0, common_1.Param)('questionId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)('questions/:questionId'),
    __param(0, (0, common_1.Param)('questionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Post)(':id/questions/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "approve", null);
exports.QuestionBanksController = QuestionBanksController = __decorate([
    (0, common_1.Controller)('courses'),
    __metadata("design:paramtypes", [question_banks_service_1.QuestionBanksService])
], QuestionBanksController);
