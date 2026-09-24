import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto, DecideDto } from './dto';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  create(@Body() dto: CreateAttemptDto) {
    return this.attemptsService.create(dto.simulationId, dto.sessionId);
  }

  @Get(':id')
  getState(@Param('id') id: string) {
    return this.attemptsService.getState(id);
  }

  @Post(':id/decisions')
  decide(@Param('id') id: string, @Body() dto: DecideDto) {
    return this.attemptsService.decide(id, dto.decisionId);
  }

  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.attemptsService.getResult(id);
  }
}
