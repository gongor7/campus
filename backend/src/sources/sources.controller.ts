import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { SourcesService } from './sources.service';

class CreateSetDto {
  @IsString() @Length(3, 100)
  name: string;

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;
}

@Controller('source-sets')
export class SourcesController {
  constructor(private readonly sources: SourcesService) {}

  @Post()
  createSet(@Body() dto: CreateSetDto) {
    return this.sources.createSet(dto.name, dto.description);
  }

  @Get()
  findSets() {
    return this.sources.findSets();
  }

  @Get(':id')
  findSet(@Param('id', ParseIntPipe) id: number) {
    return this.sources.findSet(id);
  }

  @Post(':id/sources')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 21 * 1024 * 1024 } }))
  uploadFiles(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
    return this.sources.uploadFiles(id, files ?? []);
  }

  @Delete('sources/:sourceId')
  deleteSource(@Param('sourceId', ParseIntPipe) sourceId: number) {
    return this.sources.deleteSource(sourceId);
  }
}
