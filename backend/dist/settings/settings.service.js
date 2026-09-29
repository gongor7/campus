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
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_setting_entity_1 = require("./app-setting.entity");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(settings) {
        this.settings = settings;
        this.logger = new common_1.Logger(SettingsService_1.name);
        this.cache = new Map();
    }
    async onModuleInit() {
        const rows = await this.settings.find();
        this.cache = new Map(rows.map((r) => [r.key, r.value]));
        this.logger.log(`Configuracion cargada (${rows.length} valores)`);
    }
    async get(key) {
        if (this.cache.has(key))
            return this.cache.get(key) ?? null;
        const row = await this.settings.findOne({ where: { key } });
        const value = row?.value ?? null;
        this.cache.set(key, value);
        return value;
    }
    async set(key, value) {
        const existing = await this.settings.findOne({ where: { key } });
        if (existing) {
            existing.value = value;
            await this.settings.save(existing);
        }
        else {
            await this.settings.save(this.settings.create({ key, value }));
        }
        this.cache.set(key, value);
    }
    snapshot() {
        return {
            geminiApiKey: this.cache.get('GEMINI_API_KEY') ?? null,
            forceMock: (this.cache.get('AI_FORCE_MOCK') ?? 'false') === 'true',
        };
    }
    async aiSnapshot() {
        return {
            geminiApiKey: await this.get('GEMINI_API_KEY'),
            forceMock: (await this.get('AI_FORCE_MOCK')) === 'true',
        };
    }
    mask(key) {
        if (!key)
            return null;
        return `••••••••${key.slice(-4)}`;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(app_setting_entity_1.AppSettingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
