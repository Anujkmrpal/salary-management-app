import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { Salary } from '../salaries/salary.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Salary)
    private readonly salaryRepo: Repository<Salary>,
  ) {}

  async findAll(query: QueryEmployeeDto): Promise<PaginatedResult<Employee>> {
    const { page = 1, limit = 20, search, departmentId, country, employmentType, status } = query;

    const qb = this.employeeRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.department', 'dept')
      .orderBy('e.name', 'ASC');

    if (search) {
      qb.andWhere('(e.name LIKE :search OR e.email LIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (departmentId) {
      qb.andWhere('e.departmentId = :departmentId', { departmentId });
    }
    if (country) {
      qb.andWhere('e.country = :country', { country });
    }
    if (employmentType) {
      qb.andWhere('e.employmentType = :employmentType', { employmentType });
    }
    if (status) {
      qb.andWhere('e.status = :status', { status });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const exists = await this.employeeRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException(`Email ${dto.email} is already in use`);
    }
    const employee = this.employeeRepo.create(dto);
    return this.employeeRepo.save(employee);
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    if (dto.email && dto.email !== employee.email) {
      const exists = await this.employeeRepo.findOne({ where: { email: dto.email } });
      if (exists) {
        throw new ConflictException(`Email ${dto.email} is already in use`);
      }
    }
    Object.assign(employee, dto);
    return this.employeeRepo.save(employee);
  }

  async getSalaryHistory(id: number): Promise<Salary[]> {
    await this.findOne(id); // ensure exists
    return this.salaryRepo.find({
      where: { employeeId: id },
      order: { effectiveDate: 'DESC' },
    });
  }
}
