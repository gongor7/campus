import { Body, Controller, Get, Headers, Param, ParseIntPipe, ParseBoolPipe, Post, Put } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { EnrollmentsService } from './enrollments.service';
import { StudentsService } from '../students/students.service';

class SetProgressDto {
  @IsBoolean()
  completed: boolean;
}

/** Endpoints del estudiante: la identidad viaja en el encabezado x-student-id. */
@Controller('students')
export class EnrollmentsController {
  constructor(
    private readonly enrollments: EnrollmentsService,
    private readonly students: StudentsService,
  ) {}

  @Get('courses')
  async catalog() {
    return this.enrollments.catalog();
  }

  @Post('courses/:courseId/enroll')
  async enroll(@Headers('x-student-id') studentId: string, @Param('courseId', ParseIntPipe) courseId: number) {
    await this.students.findById(studentId);
    return this.enrollments.enroll(studentId, courseId);
  }

  @Get('me/courses')
  async myCourses(@Headers('x-student-id') studentId: string) {
    await this.students.findById(studentId);
    return this.enrollments.myCourses(studentId);
  }

  @Get('me/courses/:courseId')
  async courseForStudent(@Headers('x-student-id') studentId: string, @Param('courseId', ParseIntPipe) courseId: number) {
    await this.students.findById(studentId);
    return this.enrollments.courseForStudent(studentId, courseId);
  }

  @Put('me/lessons/:lessonId/progress')
  async setProgress(
    @Headers('x-student-id') studentId: string,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: SetProgressDto,
  ) {
    await this.students.findById(studentId);
    return this.enrollments.setProgress(studentId, lessonId, dto.completed);
  }
}
