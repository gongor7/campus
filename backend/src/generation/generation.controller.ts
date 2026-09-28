import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { GenerationService } from './generation.service';

@Controller()
export class GenerationController {
  constructor(private readonly generation: GenerationService) {}

  @Post('courses/:id/generate-outline')
  generateOutline(@Param('id', ParseIntPipe) id: number) {
    return this.generation.generateOutline(id);
  }

  @Post('lessons/:lessonId/generate-content')
  generateLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.generation.generateLesson(lessonId);
  }

  @Get('courses/:id/generations')
  listByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.generation.listByCourse(id);
  }
}
