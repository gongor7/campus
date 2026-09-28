import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TemplateEntity, TemplateSection } from './template.entity';
export declare const ASFI_STANDARD_SECTIONS: TemplateSection[];
export declare class TemplatesService implements OnModuleInit {
    private readonly templates;
    private readonly logger;
    constructor(templates: Repository<TemplateEntity>);
    onModuleInit(): Promise<void>;
    findActive(): Promise<TemplateEntity[]>;
    findById(id: number): Promise<TemplateEntity>;
    modulesSection(template: TemplateEntity): TemplateSection;
    requiredSectionTypes(template: TemplateEntity): string[];
}
