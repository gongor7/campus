import { Repository } from 'typeorm';
import { SourceSetEntity } from './source-set.entity';
import { SourceEntity } from './source.entity';
import { StorageService, StoredFile } from './storage.service';
import { AuditService } from '../audit/audit.service';
export declare const MAX_FILE_BYTES: number;
export interface UploadedSource {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
}
export declare class SourcesService {
    private readonly sets;
    private readonly sourcesRepo;
    private readonly storage;
    private readonly audit;
    constructor(sets: Repository<SourceSetEntity>, sourcesRepo: Repository<SourceEntity>, storage: StorageService, audit: AuditService);
    createSet(name: string, description?: string): Promise<SourceSetEntity>;
    findSets(): Promise<SourceSetEntity[]>;
    findSet(id: number): Promise<SourceSetEntity>;
    uploadFiles(setId: number, files: UploadedSource[]): Promise<SourceEntity[]>;
    deleteSource(sourceId: number): Promise<void>;
    readSetFiles(setId: number): Promise<StoredFile[]>;
    private validateFile;
}
