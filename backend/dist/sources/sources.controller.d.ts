import { SourcesService } from './sources.service';
declare class CreateSetDto {
    name: string;
    description?: string;
}
export declare class SourcesController {
    private readonly sources;
    constructor(sources: SourcesService);
    createSet(dto: CreateSetDto): Promise<import("./source-set.entity").SourceSetEntity>;
    findSets(): Promise<import("./source-set.entity").SourceSetEntity[]>;
    findSet(id: number): Promise<import("./source-set.entity").SourceSetEntity>;
    uploadFiles(id: number, files: Express.Multer.File[]): Promise<import("./source.entity").SourceEntity[]>;
    deleteSource(sourceId: number): Promise<void>;
}
export {};
