import { IsInt, IsUUID } from 'class-validator';

export class CreateAttemptDto {
  @IsInt()
  simulationId!: number;

  @IsUUID()
  sessionId!: string;
}

export class DecideDto {
  @IsInt()
  decisionId!: number;
}
