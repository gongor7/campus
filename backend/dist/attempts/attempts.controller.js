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
exports.AttemptsController = void 0;
const common_1 = require("@nestjs/common");
const attempts_service_1 = require("./attempts.service");
const dto_1 = require("./dto");
let AttemptsController = class AttemptsController {
    constructor(attemptsService) {
        this.attemptsService = attemptsService;
    }
    create(dto) {
        return this.attemptsService.create(dto.simulationId, dto.sessionId);
    }
    getState(id) {
        return this.attemptsService.getState(id);
    }
    decide(id, dto) {
        return this.attemptsService.decide(id, dto.decisionId);
    }
    getResult(id) {
        return this.attemptsService.getResult(id);
    }
};
exports.AttemptsController = AttemptsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAttemptDto]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getState", null);
__decorate([
    (0, common_1.Post)(':id/decisions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DecideDto]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "decide", null);
__decorate([
    (0, common_1.Get)(':id/result'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getResult", null);
exports.AttemptsController = AttemptsController = __decorate([
    (0, common_1.Controller)('attempts'),
    __metadata("design:paramtypes", [attempts_service_1.AttemptsService])
], AttemptsController);
