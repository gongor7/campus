import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCourseDto {
  @IsString() @Length(3, 200)
  title: string;

  @IsOptional() @IsString() @Length(0, 2000)
  description?: string;

  @IsOptional() @IsString() @Length(0, 1000)
  objective?: string;

  @IsOptional() @IsString() @Length(0, 200)
  audience?: string;

  @IsIn(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

  @IsInt() @Min(1) @Max(200)
  targetHours: number;

  @IsOptional() @IsInt()
  templateId?: number;

  @IsOptional() @IsInt()
  sourceSetId?: number | null;
}

export class UpdateCourseDto {
  @IsOptional() @IsString() @Length(3, 200)
  title?: string;

  @IsOptional() @IsString() @Length(0, 2000)
  description?: string;

  @IsOptional() @IsString() @Length(0, 1000)
  objective?: string;

  @IsOptional() @IsString() @Length(0, 200)
  audience?: string;

  @IsOptional() @IsIn(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
  level?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

  @IsOptional() @IsInt() @Min(1) @Max(200)
  targetHours?: number;

  @IsOptional() @IsInt()
  sourceSetId?: number | null;
}

export class OutlineLessonDto {
  @IsString() @Length(1, 200)
  title: string;

  @IsOptional() @IsString()
  objective?: string;

  @IsInt() @Min(0) @Max(600)
  estimatedMinutes: number;

  @IsOptional() @IsArray() @ArrayMinSize(0) @IsString({ each: true })
  sourceRefs?: string[];
}

export class OutlineModuleDto {
  @IsString() @Length(1, 200)
  title: string;

  @IsOptional() @IsString()
  objective?: string;

  @IsInt() @Min(0) @Max(3000)
  estimatedMinutes: number;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true })
  @Type(() => OutlineLessonDto)
  lessons: OutlineLessonDto[];

  @IsOptional() @IsArray() @IsString({ each: true })
  sourceRefs?: string[];
}

export class OutlineSectionDto {
  @IsIn(['INTRODUCTION', 'PRACTICE', 'EVALUATION', 'CLOSING'])
  type: 'INTRODUCTION' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';

  @IsString() @Length(0, 200)
  title: string;

  @IsOptional() @IsString()
  content?: string;
}

export class ReplaceOutlineDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true })
  @Type(() => OutlineModuleDto)
  modules: OutlineModuleDto[];

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true })
  @Type(() => OutlineSectionDto)
  sections: OutlineSectionDto[];
}

export class UpdateLessonDto {
  @IsOptional() @IsString() @Length(1, 200)
  title?: string;

  @IsOptional() @IsString()
  objective?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsInt() @Min(0) @Max(600)
  estimatedMinutes?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  sourceRefs?: string[];
}

export class UpdateSectionDto {
  @IsOptional() @IsString() @Length(0, 200)
  title?: string;

  @IsOptional() @IsString()
  content?: string;
}
