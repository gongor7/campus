import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourceFileEntity } from './source-file.entity';

export interface StoredFile {
  filename: string;
  mimeType: string;
  /** Contenido del documento codificado en base64 (formato directo para IA). */
  base64: string;
}

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(SourceFileEntity)
    private readonly files: Repository<SourceFileEntity>,
  ) {}

  async save(sourceId: number, data: Buffer): Promise<void> {
    await this.files.save(this.files.create({ sourceId, data }));
  }

  async read(sourceId: number): Promise<Buffer> {
    const file = await this.files.findOne({ where: { sourceId } });
    if (!file) throw new NotFoundException('Archivo de la fuente no encontrado');
    return file.data;
  }
}
