import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSettingEntity } from './app-setting.entity';
import { SettingsService } from './settings.service';

/**
 * Solo el servicio y su repositorio, sin dependencias: evita ciclos con
 * GenerationModule (que registra el SettingsController porque ahi viven los
 * proveedores de IA que el controller necesita).
 */
@Module({
  imports: [TypeOrmModule.forFeature([AppSettingEntity])],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
