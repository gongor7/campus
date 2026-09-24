import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationEntity } from './simulation.entity';

@Injectable()
export class SimulationsService {
  constructor(
    @InjectRepository(SimulationEntity)
    private readonly simulations: Repository<SimulationEntity>,
  ) {}

  findAll(): Promise<SimulationEntity[]> {
    return this.simulations.find({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<SimulationEntity> {
    const simulation = await this.simulations.findOne({ where: { id } });
    if (!simulation) throw new NotFoundException('Simulación no encontrada');
    return simulation;
  }
}
