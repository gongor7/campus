"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const create_app_1 = require("./create-app");
async function bootstrap() {
    const app = await (0, create_app_1.createApp)();
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
