import { CoursesService } from './courses.service';
import { CreateCourseDto, ReplaceOutlineDto, UpdateCourseDto, UpdateLessonDto, UpdateSectionDto } from './dto';
export declare class CoursesController {
    private readonly courses;
    constructor(courses: CoursesService);
    create(dto: CreateCourseDto): Promise<import("./course.entity").CourseEntity>;
    findAll(): Promise<import("./course.entity").CourseEntity[]>;
    findOne(id: number): Promise<import("./course.entity").CourseEntity>;
    update(id: number, dto: UpdateCourseDto): Promise<import("./course.entity").CourseEntity>;
    replaceOutline(id: number, dto: ReplaceOutlineDto): Promise<import("./course.entity").CourseEntity>;
    updateLesson(lessonId: number, dto: UpdateLessonDto): Promise<import("./lesson.entity").LessonEntity>;
    updateSection(sectionId: number, dto: UpdateSectionDto): Promise<import("./course-section.entity").CourseSectionEntity>;
    archive(id: number): Promise<import("./course.entity").CourseEntity>;
}
