import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttemptsService } from './attempts.service';
import { StudentsService } from '../students/students.service';

class SubmitAnswerDto {
  @IsInt()
  questionId: number;

  @IsString()
  answer: string;
}

class SubmitAttemptDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}

@Controller('students')
export class AttemptsController {
  constructor(
    private readonly attempts: AttemptsService,
    private readonly students: StudentsService,
  ) {}

  @Post('me/courses/:courseId/attempts')
  async start(@Headers('x-student-id') studentId: string, @Param('courseId', ParseIntPipe) courseId: number) {
    await this.students.findById(studentId);
    return this.attempts.start(studentId, courseId);
  }

  @Post('me/attempts/:attemptId/submit')
  async submit(
    @Headers('x-student-id') studentId: string,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    await this.students.findById(studentId);
    return this.attempts.submit(studentId, attemptId, dto.answers);
  }

  @Get('me/attempts/:attemptId')
  async getAttempt(@Headers('x-student-id') studentId: string, @Param('attemptId') attemptId: string) {
    await this.students.findById(studentId);
    return this.attempts.getAttempt(attemptId, studentId);
  }

  @Get('me/courses/:courseId/attempts')
  async history(@Headers('x-student-id') studentId: string, @Param('courseId', ParseIntPipe) courseId: number) {
    await this.students.findById(studentId);
    return this.attempts.history(studentId, courseId);
  }
}
