"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const source_set_entity_1 = require("./source-set.entity");
const source_entity_1 = require("./source.entity");
const source_file_entity_1 = require("./source-file.entity");
const storage_service_1 = require("./storage.service");
const sources_service_1 = require("./sources.service");
const sources_controller_1 = require("./sources.controller");
const audit_module_1 = require("../audit/audit.module");
let SourcesModule = class SourcesModule {
};
exports.SourcesModule = SourcesModule;
exports.SourcesModule = SourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([source_set_entity_1.SourceSetEntity, source_entity_1.SourceEntity, source_file_entity_1.SourceFileEntity]), audit_module_1.AuditModule],
        providers: [storage_service_1.StorageService, sources_service_1.SourcesService],
        controllers: [sources_controller_1.SourcesController],
        exports: [sources_service_1.SourcesService, storage_service_1.StorageService],
    })
], SourcesModule);
