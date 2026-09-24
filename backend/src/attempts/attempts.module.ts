import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttemptEntity } from './attempt.entity';
import { AttemptStepEntity } from './attempt-step.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { EvaluationService } from '../evaluation/evaluation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttemptEntity, AttemptStepEntity, ScenarioEntity, DecisionEntity]),
  ],
  controllers: [AttemptsController],
  providers: [AttemptsService, EvaluationService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
