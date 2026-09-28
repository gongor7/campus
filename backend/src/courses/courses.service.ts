import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity, CourseStatus } from './course.entity';
import { CourseModuleEntity } from './course-module.entity';
import { LessonEntity } from './lesson.entity';
import { CourseSectionEntity } from './course-section.entity';
import { CreateCourseDto, OutlineModuleDto, ReplaceOutlineDto, UpdateCourseDto, UpdateLessonDto, UpdateSectionDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { TemplatesService } from '../templates/templates.service';
import { TemplateValidatorService } from '../templates/template-validator.service';
import { TemplateEntity } from '../templates/template.entity';

const EDITABLE_STATUSES: CourseStatus[] = ['DRAFT', 'REVIEW'];

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity) private readonly courses: Repository<CourseEntity>,
    @InjectRepository(CourseModuleEntity) private readonly modules: Repository<CourseModuleEntity>,
    @InjectRepository(LessonEntity) private readonly lessons: Repository<LessonEntity>,
    @InjectRepository(CourseSectionEntity) private readonly sectionsRepo: Repository<CourseSectionEntity>,
    private readonly audit: AuditService,
    private readonly templates: TemplatesService,
    private readonly validator: TemplateValidatorService,
  ) {}

  async create(dto: CreateCourseDto): Promise<CourseEntity> {
    const templateId = dto.templateId ?? (await this.defaultTemplate()).id;
    const course = await this.courses.save(
      this.courses.create({ ...dto, templateId, sourceSetId: dto.sourceSetId ?? null }),
    );
    await this.audit.log({ action: 'COURSE_CREATED', resourceType: 'COURSE', resourceId: course.id, detail: { title: course.title } });
    return course;
  }

  findAll(): Promise<CourseEntity[]> {
    return this.courses.find({ order: { updatedAt: 'DESC' } });
  }

  async findById(id: number): Promise<CourseEntity> {
    const course = await this.courses.findOne({
      where: { id },
      relations: {
        modules: { lessons: true },
        sections: true,
        template: true,
        sourceSet: { sources: true },
      },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');
    this.sortTree(course);
    return course;
  }

  async update(id: number, dto: UpdateCourseDto): Promise<CourseEntity> {
    const course = await this.findEditable(id);
    Object.assign(course, dto);
    const saved = await this.courses.save(course);
    await this.audit.log({ action: 'COURSE_UPDATED', resourceType: 'COURSE', resourceId: id });
    return saved;
  }

  /**
   * Reemplaza la estructura completa del curso (modulos, lecciones y secciones),
   * validandola contra la plantilla institucional antes de persistir.
   */
  async replaceOutline(id: number, dto: ReplaceOutlineDto): Promise<CourseEntity> {
    const course = await this.findEditable(id);
    const template = course.template ?? (await this.templates.findById(course.templateId));
    const errors = this.validator.validate(
      {
        modules: dto.modules.map((m) => ({ title: m.title, lessons: m.lessons.map((l) => ({ title: l.title })) })),
        sections: dto.sections.map((s) => ({ type: s.type })),
      },
      template,
    );
    if (errors.length > 0) throw new BadRequestException(errors);

    await this.modules.delete({ courseId: id });
    await this.sectionsRepo.delete({ courseId: id });

    for (const [moduleIndex, moduleDto] of dto.modules.entries()) {
      await this.insertModule(course, moduleDto, moduleIndex);
    }
    for (const [sectionIndex, sectionDto] of dto.sections.entries()) {
      await this.sectionsRepo.save(
        this.sectionsRepo.create({
          courseId: id,
          type: sectionDto.type,
          title: sectionDto.title,
          content: sectionDto.content ?? null,
          position: sectionIndex,
        }),
      );
    }

    await this.audit.log({ action: 'OUTLINE_REPLACED', resourceType: 'COURSE', resourceId: id, detail: { modules: dto.modules.length } });
    return this.findById(id);
  }

  async updateLesson(lessonId: number, dto: UpdateLessonDto): Promise<LessonEntity> {
    const lesson = await this.lessons.findOne({ where: { id: lessonId }, relations: { course: true } });
    if (!lesson) throw new NotFoundException('Leccion no encontrada');
    if (!EDITABLE_STATUSES.includes(lesson.course.status)) {
      throw new BadRequestException('El curso no es editable en su estado actual');
    }
    Object.assign(lesson, dto);
    const saved = await this.lessons.save(lesson);
    await this.audit.log({ action: 'LESSON_UPDATED', resourceType: 'LESSON', resourceId: lessonId, detail: { courseId: lesson.courseId } });
    return saved;
  }

  async updateSection(sectionId: number, dto: UpdateSectionDto): Promise<CourseSectionEntity> {
    const section = await this.sectionsRepo.findOne({ where: { id: sectionId }, relations: { course: true } });
    if (!section) throw new NotFoundException('Seccion no encontrada');
    if (!EDITABLE_STATUSES.includes(section.course.status)) {
      throw new BadRequestException('El curso no es editable en su estado actual');
    }
    Object.assign(section, dto);
    const saved = await this.sectionsRepo.save(section);
    await this.audit.log({ action: 'SECTION_UPDATED', resourceType: 'SECTION', resourceId: sectionId, detail: { courseId: section.courseId } });
    return saved;
  }

  async archive(id: number): Promise<CourseEntity> {
    const course = await this.findEditable(id);
    course.status = 'ARCHIVED';
    const saved = await this.courses.save(course);
    await this.audit.log({ action: 'COURSE_ARCHIVED', resourceType: 'COURSE', resourceId: id });
    return saved;
  }

  private async insertModule(course: CourseEntity, dto: OutlineModuleDto, position: number): Promise<void> {
    const module = await this.modules.save(
      this.modules.create({
        courseId: course.id,
        title: dto.title,
        objective: dto.objective ?? null,
        position,
        estimatedMinutes: dto.estimatedMinutes,
      }),
    );
    for (const [lessonIndex, lessonDto] of dto.lessons.entries()) {
      await this.lessons.save(
        this.lessons.create({
          courseId: course.id,
          moduleId: module.id,
          title: lessonDto.title,
          objective: lessonDto.objective ?? null,
          estimatedMinutes: lessonDto.estimatedMinutes,
          sourceRefs: lessonDto.sourceRefs ?? null,
          position: lessonIndex,
        }),
      );
    }
  }

  private async findEditable(id: number): Promise<CourseEntity> {
    const course = await this.courses.findOne({ where: { id }, relations: { template: true } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!EDITABLE_STATUSES.includes(course.status)) {
      throw new BadRequestException('El curso no es editable en su estado actual');
    }
    return course;
  }

  private async defaultTemplate(): Promise<TemplateEntity> {
    const all = await this.templates.findActive();
    const standard = all.find((t) => t.code === 'ASFI_STANDARD');
    return standard ?? all[0];
  }

  private sortTree(course: CourseEntity): void {
    course.modules.sort((a, b) => a.position - b.position);
    for (const module of course.modules) {
      module.lessons.sort((a, b) => a.position - b.position);
    }
    course.sections.sort((a, b) => a.position - b.position);
  }
}
