import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationEntity } from './simulation.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { SimulationsController } from './simulations.controller';
import { SimulationsService } from './simulations.service';

@Module({
  imports: [TypeOrmModule.forFeature([SimulationEntity, ScenarioEntity])],
  controllers: [SimulationsController],
  providers: [SimulationsService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
