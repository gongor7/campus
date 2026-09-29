"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const health_module_1 = require("./health/health.module");
const audit_module_1 = require("./audit/audit.module");
const templates_module_1 = require("./templates/templates.module");
const sources_module_1 = require("./sources/sources.module");
const courses_module_1 = require("./courses/courses.module");
const generation_module_1 = require("./generation/generation.module");
const publication_module_1 = require("./publication/publication.module");
const students_module_1 = require("./students/students.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const question_banks_module_1 = require("./question-banks/question-banks.module");
const attempts_module_1 = require("./attempts/attempts.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const common = { autoLoadEntities: true, synchronize: true };
                    const url = config.get('DATABASE_URL');
                    if (url) {
                        return {
                            type: 'postgres',
                            url,
                            ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
                            ...common,
                        };
                    }
                    return {
                        type: 'postgres',
                        host: config.get('DB_HOST', 'localhost'),
                        port: config.get('DB_PORT', 5433),
                        username: config.get('DB_USER', 'campus'),
                        password: config.get('DB_PASSWORD', 'campus'),
                        database: config.get('DB_NAME', 'campus_cursos'),
                        ...common,
                    };
                },
            }),
            health_module_1.HealthModule,
            audit_module_1.AuditModule,
            templates_module_1.TemplatesModule,
            sources_module_1.SourcesModule,
            courses_module_1.CoursesModule,
            generation_module_1.GenerationModule,
            publication_module_1.PublicationModule,
            students_module_1.StudentsModule,
            enrollments_module_1.EnrollmentsModule,
            question_banks_module_1.QuestionBanksModule,
            attempts_module_1.AttemptsModule,
            settings_module_1.SettingsModule,
        ],
    })
], AppModule);
