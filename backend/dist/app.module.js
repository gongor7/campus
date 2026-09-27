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
const simulations_module_1 = require("./simulations/simulations.module");
const attempts_module_1 = require("./attempts/attempts.module");
const seed_module_1 = require("./seed/seed.module");
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
                        port: config.get('DB_PORT', 5432),
                        username: config.get('DB_USER', 'campus'),
                        password: config.get('DB_PASSWORD', 'campus'),
                        database: config.get('DB_NAME', 'campus_asfi'),
                        ...common,
                    };
                },
            }),
            seed_module_1.SeedModule,
            simulations_module_1.SimulationsModule,
            attempts_module_1.AttemptsModule,
        ],
    })
], AppModule);
