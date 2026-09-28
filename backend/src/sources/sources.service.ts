import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourceSetEntity } from './source-set.entity';
import { SourceEntity } from './source.entity';
import { StorageService, StoredFile } from './storage.service';
import { AuditService } from '../audit/audit.service';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.ms-powerpoint',
]);

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export interface UploadedSource {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(SourceSetEntity) private readonly sets: Repository<SourceSetEntity>,
    @InjectRepository(SourceEntity) private readonly sourcesRepo: Repository<SourceEntity>,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  async createSet(name: string, description?: string): Promise<SourceSetEntity> {
    const set = await this.sets.save(this.sets.create({ name, description: description ?? null }));
    await this.audit.log({ action: 'SOURCE_SET_CREATED', resourceType: 'SOURCE_SET', resourceId: set.id, detail: { name } });
    return set;
  }

  async findSets(): Promise<SourceSetEntity[]> {
    return this.sets.find({ relations: { sources: true }, order: { createdAt: 'DESC' } });
  }

  async findSet(id: number): Promise<SourceSetEntity> {
    const set = await this.sets.findOne({ where: { id }, relations: { sources: true } });
    if (!set) throw new NotFoundException('Cuaderno no encontrado');
    return set;
  }

  async uploadFiles(setId: number, files: UploadedSource[]): Promise<SourceEntity[]> {
    if (!files || files.length === 0) throw new BadRequestException('No se recibieron archivos');
    const set = await this.findSet(setId);

    const saved: SourceEntity[] = [];
    for (const file of files) {
      this.validateFile(file);
      const source = await this.sourcesRepo.save(
        this.sourcesRepo.create({
          sourceSetId: set.id,
          filename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.buffer.length,
          storagePath: '',
        }),
      );
      source.storagePath = `db:${source.id}`;
      await this.sourcesRepo.save(source);
      await this.storage.save(source.id, file.buffer);
      saved.push(source);
    }

    await this.audit.log({
      action: 'SOURCES_UPLOADED',
      resourceType: 'SOURCE_SET',
      resourceId: setId,
      detail: { files: saved.map((s) => s.filename) },
    });
    return saved;
  }

  async deleteSource(sourceId: number): Promise<void> {
    const source = await this.sourcesRepo.findOne({ where: { id: sourceId } });
    if (!source) throw new NotFoundException('Fuente no encontrada');
    await this.sourcesRepo.delete({ id: sourceId });
    await this.audit.log({ action: 'SOURCE_DELETED', resourceType: 'SOURCE_SET', resourceId: source.sourceSetId, detail: { filename: source.filename } });
  }

  /** Fuentes de un cuaderno como archivos listos para el proveedor de IA. */
  async readSetFiles(setId: number): Promise<StoredFile[]> {
    const set = await this.findSet(setId);
    const files: StoredFile[] = [];
    for (const source of set.sources) {
      const data = await this.storage.read(source.id);
      files.push({ filename: source.filename, mimeType: source.mimeType, base64: data.toString('base64') });
    }
    return files;
  }

  private validateFile(file: UploadedSource): void {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(`Tipo no permitido: ${file.mimetype}. Formatos: PDF, PPTX, DOCX, TXT, MD.`);
    }
    if (file.buffer.length > MAX_FILE_BYTES) {
      throw new BadRequestException(`El archivo ${file.originalname} supera el limite de 20 MB.`);
    }
    if (!file.originalname || file.originalname.trim().length === 0) {
      throw new BadRequestException('El archivo no tiene nombre.');
    }
  }
}
