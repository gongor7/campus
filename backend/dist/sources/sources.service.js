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
exports.SourcesService = exports.MAX_FILE_BYTES = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const source_set_entity_1 = require("./source-set.entity");
const source_entity_1 = require("./source.entity");
const storage_service_1 = require("./storage.service");
const audit_service_1 = require("../audit/audit.service");
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.ms-powerpoint',
]);
exports.MAX_FILE_BYTES = 20 * 1024 * 1024;
let SourcesService = class SourcesService {
    constructor(sets, sourcesRepo, storage, audit) {
        this.sets = sets;
        this.sourcesRepo = sourcesRepo;
        this.storage = storage;
        this.audit = audit;
    }
    async createSet(name, description) {
        const set = await this.sets.save(this.sets.create({ name, description: description ?? null }));
        await this.audit.log({ action: 'SOURCE_SET_CREATED', resourceType: 'SOURCE_SET', resourceId: set.id, detail: { name } });
        return set;
    }
    async findSets() {
        return this.sets.find({ relations: { sources: true }, order: { createdAt: 'DESC' } });
    }
    async findSet(id) {
        const set = await this.sets.findOne({ where: { id }, relations: { sources: true } });
        if (!set)
            throw new common_1.NotFoundException('Cuaderno no encontrado');
        return set;
    }
    async uploadFiles(setId, files) {
        if (!files || files.length === 0)
            throw new common_1.BadRequestException('No se recibieron archivos');
        const set = await this.findSet(setId);
        const saved = [];
        for (const file of files) {
            this.validateFile(file);
            const source = await this.sourcesRepo.save(this.sourcesRepo.create({
                sourceSetId: set.id,
                filename: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.buffer.length,
                storagePath: '',
            }));
            source.storagePath = `db:${source.id}`;
            await this.sourcesRepo.save(source);
            await this.storage.save(source.id, file.buffer);
            saved.push(source);
        }
        await this.audit.log({
            action: 'SOURCES_UPLOADED',
            resourceType: 'SOURCE_SET',
            resourceId: setId,
            detail: { files: saved.map((s) => s.filename) },
        });
        return saved;
    }
    async deleteSource(sourceId) {
        const source = await this.sourcesRepo.findOne({ where: { id: sourceId } });
        if (!source)
            throw new common_1.NotFoundException('Fuente no encontrada');
        await this.sourcesRepo.delete({ id: sourceId });
        await this.audit.log({ action: 'SOURCE_DELETED', resourceType: 'SOURCE_SET', resourceId: source.sourceSetId, detail: { filename: source.filename } });
    }
    async readSetFiles(setId) {
        const set = await this.findSet(setId);
        const files = [];
        for (const source of set.sources) {
            const data = await this.storage.read(source.id);
            files.push({ filename: source.filename, mimeType: source.mimeType, base64: data.toString('base64') });
        }
        return files;
    }
    validateFile(file) {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException(`Tipo no permitido: ${file.mimetype}. Formatos: PDF, PPTX, DOCX, TXT, MD.`);
        }
        if (file.buffer.length > exports.MAX_FILE_BYTES) {
            throw new common_1.BadRequestException(`El archivo ${file.originalname} supera el limite de 20 MB.`);
        }
        if (!file.originalname || file.originalname.trim().length === 0) {
            throw new common_1.BadRequestException('El archivo no tiene nombre.');
        }
    }
};
exports.SourcesService = SourcesService;
exports.SourcesService = SourcesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(source_set_entity_1.SourceSetEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(source_entity_1.SourceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService,
        audit_service_1.AuditService])
], SourcesService);
