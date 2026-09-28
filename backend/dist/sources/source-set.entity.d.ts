import { SourceEntity } from './source.entity';
export declare class SourceSetEntity {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date;
    sources: SourceEntity[];
}
