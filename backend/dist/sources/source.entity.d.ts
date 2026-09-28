import { SourceSetEntity } from './source-set.entity';
export declare class SourceEntity {
    id: number;
    sourceSetId: number;
    sourceSet: SourceSetEntity;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
    uploadedBy: string;
    createdAt: Date;
}
