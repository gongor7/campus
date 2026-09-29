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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mock_provider_1 = require("./mock.provider");
const gemini_provider_1 = require("./gemini.provider");
const settings_service_1 = require("../settings/settings.service");
let AiProviderService = class AiProviderService {
    constructor(mock, gemini, settings, config) {
        this.mock = mock;
        this.gemini = gemini;
        this.settings = settings;
        this.config = config;
    }
    get provider() {
        const snapshot = this.settings.snapshot();
        const envProvider = process.env.AI_PROVIDER ?? this.config.get('AI_PROVIDER') ?? 'gemini';
        if (envProvider === 'mock' || snapshot.forceMock)
            return this.mock;
        if (snapshot.geminiApiKey || this.config.get('GEMINI_API_KEY'))
            return this.gemini;
        return this.mock;
    }
    get name() {
        return this.provider.name;
    }
    get model() {
        return this.provider.model;
    }
};
exports.AiProviderService = AiProviderService;
exports.AiProviderService = AiProviderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_provider_1.MockProvider,
        gemini_provider_1.GeminiProvider,
        settings_service_1.SettingsService,
        config_1.ConfigService])
], AiProviderService);
