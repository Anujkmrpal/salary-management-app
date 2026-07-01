import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from './salary.entity';
import { Employee } from '../employees/employee.entity';
import { CreateSalaryDto } from './dto/create-salary.dto';

@Injectable()
export class SalariesService {
  constructor(
    @InjectRepository(Salary)
    private readonly salaryRepo: Repository<Salary>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateSalaryDto): Promise<Salary> {
    const employee = await this.employeeRepo.findOne({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee #${dto.employeeId} not found`);
    }
    const salary = this.salaryRepo.create(dto);
    return this.salaryRepo.save(salary);
  }

  async findByEmployee(employeeId: number): Promise<Salary[]> {
    return this.salaryRepo.find({
      where: { employeeId },
      order: { effectiveDate: 'DESC' },
    });
  }

  async getLatestSalary(employeeId: number): Promise<Salary | null> {
    return this.salaryRepo.findOne({
      where: { employeeId },
      order: { effectiveDate: 'DESC' },
    });
  }
}
