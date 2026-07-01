import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Department | null> {
    return this.departmentRepo.findOne({ where: { id } });
  }

  async findOrCreate(name: string): Promise<Department> {
    let dept = await this.departmentRepo.findOne({ where: { name } });
    if (!dept) {
      dept = this.departmentRepo.create({ name });
      dept = await this.departmentRepo.save(dept);
    }
    return dept;
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const dept = this.departmentRepo.create(dto);
    return this.departmentRepo.save(dept);
  }
}
