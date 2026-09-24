import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationEntity } from '../simulations/simulation.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([SimulationEntity, ScenarioEntity, DecisionEntity])],
  providers: [SeedService],
})
export class SeedModule {}
