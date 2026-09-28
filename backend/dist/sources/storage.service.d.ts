import { Repository } from 'typeorm';
import { SourceFileEntity } from './source-file.entity';
export interface StoredFile {
    filename: string;
    mimeType: string;
    base64: string;
}
export declare class StorageService {
    private readonly files;
    constructor(files: Repository<SourceFileEntity>);
    save(sourceId: number, data: Buffer): Promise<void>;
    read(sourceId: number): Promise<Buffer>;
}
