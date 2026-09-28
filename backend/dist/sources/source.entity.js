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
exports.SourceEntity = void 0;
const typeorm_1 = require("typeorm");
const source_set_entity_1 = require("./source-set.entity");
let SourceEntity = class SourceEntity {
};
exports.SourceEntity = SourceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SourceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SourceEntity.prototype, "sourceSetId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => source_set_entity_1.SourceSetEntity, (set) => set.sources),
    (0, typeorm_1.JoinColumn)({ name: 'sourceSetId' }),
    __metadata("design:type", source_set_entity_1.SourceSetEntity)
], SourceEntity.prototype, "sourceSet", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], SourceEntity.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], SourceEntity.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SourceEntity.prototype, "sizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, default: '' }),
    __metadata("design:type", String)
], SourceEntity.prototype, "storagePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'docente' }),
    __metadata("design:type", String)
], SourceEntity.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SourceEntity.prototype, "createdAt", void 0);
exports.SourceEntity = SourceEntity = __decorate([
    (0, typeorm_1.Entity)('sources'),
    (0, typeorm_1.Index)('ix_source_set', ['sourceSetId'])
], SourceEntity);
