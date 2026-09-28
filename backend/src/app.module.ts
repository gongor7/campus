import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { TemplatesModule } from './templates/templates.module';
import { SourcesModule } from './sources/sources.module';
import { CoursesModule } from './courses/courses.module';
import { GenerationModule } from './generation/generation.module';
import { PublicationModule } from './publication/publication.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const common = { autoLoadEntities: true, synchronize: true };

        // Produccion: una unica DATABASE_URL (Supabase, TLS obligatorio).
        const url = config.get<string>('DATABASE_URL');
        if (url) {
          return {
            type: 'postgres' as const,
            url,
            ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
            ...common,
          };
        }

        // Desarrollo local: variables DB_* del .env (ver docker-compose.yml).
        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5433),
          username: config.get<string>('DB_USER', 'campus'),
          password: config.get<string>('DB_PASSWORD', 'campus'),
          database: config.get<string>('DB_NAME', 'campus_cursos'),
          ...common,
        };
      },
    }),
    HealthModule,
    AuditModule,
    TemplatesModule,
    SourcesModule,
    CoursesModule,
    GenerationModule,
    PublicationModule,
    StudentsModule,
  ],
})
export class AppModule {}
