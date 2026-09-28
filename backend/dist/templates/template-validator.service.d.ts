import { TemplateEntity } from './template.entity';
import { TemplatesService } from './templates.service';
export interface OutlineLike {
    modules: {
        title: string;
        lessons: {
            title: string;
        }[];
    }[];
    sections: {
        type: string;
    }[];
}
export declare class TemplateValidatorService {
    private readonly templates;
    constructor(templates: TemplatesService);
    validate(outline: OutlineLike, template: TemplateEntity): string[];
}
