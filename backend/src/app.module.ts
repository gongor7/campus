import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationsModule } from './simulations/simulations.module';
import { AttemptsModule } from './attempts/attempts.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const common = { autoLoadEntities: true, synchronize: true }; // MVP: sin migraciones formales

        // Producción (Vercel + Supabase): una única DATABASE_URL.
        const url = config.get<string>('DATABASE_URL');
        if (url) {
          return {
            type: 'postgres' as const,
            url,
            // Supabase exige TLS; en local (docker) el ssl debe quedar desactivado.
            ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
            ...common,
          };
        }

        // Desarrollo local: variables DB_* del .env (ver docker-compose.yml).
        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'campus'),
          password: config.get<string>('DB_PASSWORD', 'campus'),
          database: config.get<string>('DB_NAME', 'campus_asfi'),
          ...common,
        };
      },
    }),
    SeedModule,
    SimulationsModule,
    AttemptsModule,
  ],
})
export class AppModule {}
