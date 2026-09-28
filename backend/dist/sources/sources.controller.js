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
exports.SourcesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const sources_service_1 = require("./sources.service");
class CreateSetDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 100),
    __metadata("design:type", String)
], CreateSetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateSetDto.prototype, "description", void 0);
let SourcesController = class SourcesController {
    constructor(sources) {
        this.sources = sources;
    }
    createSet(dto) {
        return this.sources.createSet(dto.name, dto.description);
    }
    findSets() {
        return this.sources.findSets();
    }
    findSet(id) {
        return this.sources.findSet(id);
    }
    uploadFiles(id, files) {
        return this.sources.uploadFiles(id, files ?? []);
    }
    deleteSource(sourceId) {
        return this.sources.deleteSource(sourceId);
    }
};
exports.SourcesController = SourcesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSetDto]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "createSet", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "findSets", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "findSet", null);
__decorate([
    (0, common_1.Post)(':id/sources'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: 21 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Delete)('sources/:sourceId'),
    __param(0, (0, common_1.Param)('sourceId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "deleteSource", null);
exports.SourcesController = SourcesController = __decorate([
    (0, common_1.Controller)('source-sets'),
    __metadata("design:paramtypes", [sources_service_1.SourcesService])
], SourcesController);
