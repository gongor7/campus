import { SourceEntity } from './source.entity';
export declare class SourceFileEntity {
    id: number;
    sourceId: number;
    source: SourceEntity;
    data: Buffer;
}
