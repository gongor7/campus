import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, ReplaceOutlineDto, UpdateCourseDto, UpdateLessonDto, UpdateSectionDto } from './dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courses.create(dto);
  }

  @Get()
  findAll() {
    return this.courses.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courses.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.courses.update(id, dto);
  }

  @Put(':id/outline')
  replaceOutline(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplaceOutlineDto) {
    return this.courses.replaceOutline(id, dto);
  }

  @Patch('lessons/:lessonId')
  updateLesson(@Param('lessonId', ParseIntPipe) lessonId: number, @Body() dto: UpdateLessonDto) {
    return this.courses.updateLesson(lessonId, dto);
  }

  @Patch('sections/:sectionId')
  updateSection(@Param('sectionId', ParseIntPipe) sectionId: number, @Body() dto: UpdateSectionDto) {
    return this.courses.updateSection(sectionId, dto);
  }

  @Post(':id/archive')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.courses.archive(id);
  }
}
