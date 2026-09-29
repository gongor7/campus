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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const settings_service_1 = require("./settings.service");
const ai_provider_service_1 = require("../generation/ai-provider.service");
const gemini_provider_1 = require("../generation/gemini.provider");
const audit_service_1 = require("../audit/audit.service");
class UpdateAiSettingsDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", Object)
], UpdateAiSettingsDto.prototype, "geminiApiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", Object)
], UpdateAiSettingsDto.prototype, "geminiModel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAiSettingsDto.prototype, "forceMock", void 0);
let SettingsController = class SettingsController {
    constructor(settings, ai, gemini, audit) {
        this.settings = settings;
        this.ai = ai;
        this.gemini = gemini;
        this.audit = audit;
    }
    async status() {
        const snapshot = await this.settings.aiSnapshot();
        return {
            provider: this.ai.provider.name,
            model: this.ai.provider.model,
            modelSource: snapshot.geminiModel ? 'configuracion' : 'predeterminado',
            geminiConfigured: Boolean(snapshot.geminiApiKey),
            maskedKey: this.settings.mask(snapshot.geminiApiKey),
            forceMock: snapshot.forceMock,
        };
    }
    async models() {
        const snapshot = await this.settings.aiSnapshot();
        if (!snapshot.geminiApiKey)
            return { models: [] };
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${snapshot.geminiApiKey}&pageSize=100`);
            if (!res.ok)
                return { models: [], error: `No se pudo listar modelos (HTTP ${res.status})` };
            const data = (await res.json());
            const models = (data.models ?? [])
                .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
                .filter((m) => !/tts|image|transcribe|computer-use|lyria|robotics|banana|clip|deep-research|omni|antigravity|customtools/i.test(m.name))
                .map((m) => m.name.replace('models/', ''))
                .sort();
            return { models };
        }
        catch (error) {
            return { models: [], error: error.message };
        }
    }
    async update(dto) {
        if (dto.geminiApiKey !== undefined) {
            const key = dto.geminiApiKey === null || dto.geminiApiKey.trim() === '' ? null : dto.geminiApiKey.trim();
            await this.settings.set('GEMINI_API_KEY', key);
        }
        if (dto.geminiModel !== undefined) {
            const model = dto.geminiModel === null || dto.geminiModel.trim() === '' ? null : dto.geminiModel.trim();
            await this.settings.set('GEMINI_MODEL', model);
        }
        if (dto.forceMock !== undefined) {
            await this.settings.set('AI_FORCE_MOCK', dto.forceMock ? 'true' : 'false');
        }
        await this.audit.log({
            action: 'SETTINGS_UPDATED',
            resourceType: 'SETTINGS',
            resourceId: 'ai',
            detail: { geminiKeyChanged: dto.geminiApiKey !== undefined, geminiModel: dto.geminiModel ?? undefined, forceMock: dto.forceMock },
        });
        return this.status();
    }
    async test() {
        try {
            const answer = await this.gemini.ping();
            return { ok: true, message: answer };
        }
        catch (error) {
            return { ok: false, message: error.message };
        }
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('ai'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('ai/models'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "models", null);
__decorate([
    (0, common_1.Put)('ai'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateAiSettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('ai/test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "test", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        ai_provider_service_1.AiProviderService,
        gemini_provider_1.GeminiProvider,
        audit_service_1.AuditService])
], SettingsController);
