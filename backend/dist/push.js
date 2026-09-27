"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function main() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn', 'log'] });
    await app.init();
    await app.close();
    process.exit(0);
}
void main();
