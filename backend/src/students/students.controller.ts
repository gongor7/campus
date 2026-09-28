import { Body, Controller, Post } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';
import { StudentsService } from './students.service';

class SessionDto {
  @IsString() @MaxLength(200)
  name: string;

  @IsString() @MaxLength(200)
  email: string;
}

@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Post('session')
  session(@Body() dto: SessionDto) {
    return this.students.session(dto);
  }
}
