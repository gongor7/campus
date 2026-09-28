import { PublicationService } from './publication.service';
export declare class PublicationController {
    private readonly publication;
    constructor(publication: PublicationService);
    submitReview(id: number): Promise<import("../courses/course.entity").CourseEntity>;
    publish(id: number): Promise<import("../courses/course.entity").CourseEntity>;
}
