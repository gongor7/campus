"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.enableCors();
    await app.init();
    return app;
}
