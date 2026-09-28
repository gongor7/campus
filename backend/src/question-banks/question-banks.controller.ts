import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { QuestionBanksService } from './question-banks.service';

class QuestionDto {
  @IsString() @MaxLength(5000)
  caseText: string;

  @IsString() @MaxLength(2000)
  prompt: string;

  @IsArray() @IsString({ each: true })
  expectedConcepts: string[];

  @IsArray() @IsString({ each: true })
  sourceRefs: string[];

  @IsOptional()
  variationTemplate?: { variableAspects: string[]; constraints: string };
}

class UpdateQuestionDto {
  @IsOptional() @IsString() @MaxLength(5000)
  caseText?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  prompt?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  expectedConcepts?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  sourceRefs?: string[];

  @IsOptional()
  variationTemplate?: { variableAspects: string[]; constraints: string };
}

@Controller('courses')
export class QuestionBanksController {
  constructor(private readonly banks: QuestionBanksService) {}

  @Post(':id/questions/generate')
  generate(@Param('id', ParseIntPipe) id: number) {
    return this.banks.generate(id);
  }

  @Get(':id/questions')
  findByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.banks.findByCourse(id);
  }

  @Post(':id/questions')
  addQuestion(@Param('id', ParseIntPipe) id: number, @Body() dto: QuestionDto) {
    return this.banks.addQuestion(id, dto);
  }

  @Patch('questions/:questionId')
  updateQuestion(@Param('questionId', ParseIntPipe) questionId: number, @Body() dto: UpdateQuestionDto) {
    return this.banks.updateQuestion(questionId, dto);
  }

  @Delete('questions/:questionId')
  deleteQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.banks.deleteQuestion(questionId);
  }

  @Post(':id/questions/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.banks.approve(id);
  }
}
