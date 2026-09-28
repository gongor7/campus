import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templates;
    constructor(templates: TemplatesService);
    findAll(): Promise<import("./template.entity").TemplateEntity[]>;
    findOne(id: number): Promise<import("./template.entity").TemplateEntity>;
}
