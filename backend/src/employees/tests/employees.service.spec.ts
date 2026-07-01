import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesService } from '../employees.service';
import { Employee, EmploymentType, EmployeeStatus } from '../employee.entity';
import { Salary } from '../../salaries/salary.entity';

const mockEmployee = (overrides = {}): Partial<Employee> => ({
  id: 1,
  name: 'Jane Doe',
  email: 'jane.doe@acme.com',
  gender: 'Female',
  country: 'United States',
  employmentType: EmploymentType.FULL_TIME,
  status: EmployeeStatus.ACTIVE,
  hireDate: '2022-01-01',
  departmentId: 1,
  ...overrides,
});

const makeEmployeeRepo = (overrides = {}) => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  }),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn(async (e) => ({ ...e, id: 1 })),
  count: jest.fn().mockResolvedValue(0),
  ...overrides,
});

const makeSalaryRepo = (overrides = {}) => ({
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  ...overrides,
});

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepo: ReturnType<typeof makeEmployeeRepo>;
  let salaryRepo: ReturnType<typeof makeSalaryRepo>;

  beforeEach(async () => {
    employeeRepo = makeEmployeeRepo();
    salaryRepo = makeSalaryRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: employeeRepo },
        { provide: getRepositoryToken(Salary), useValue: salaryRepo },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  describe('create', () => {
    it('creates an employee when email is unique', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      employeeRepo.save.mockResolvedValue(mockEmployee());

      const dto = {
        name: 'Jane Doe',
        email: 'jane.doe@acme.com',
        country: 'United States',
        hireDate: '2022-01-01',
      };

      const result = await service.create(dto);
      expect(result.email).toBe('jane.doe@acme.com');
      expect(employeeRepo.save).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when email already exists', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee());

      await expect(
        service.create({
          name: 'Duplicate',
          email: 'jane.doe@acme.com',
          country: 'UK',
          hireDate: '2023-01-01',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns employee when found', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee());
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('throws NotFoundException when employee does not exist', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates employee fields correctly', async () => {
      const existing = mockEmployee() as Employee;
      employeeRepo.findOne.mockResolvedValue(existing);
      employeeRepo.save.mockResolvedValue({ ...existing, country: 'Canada' });

      const result = await service.update(1, { country: 'Canada' });
      expect(result.country).toBe('Canada');
    });

    it('throws ConflictException when updating to existing email', async () => {
      const existing = mockEmployee({ id: 1, email: 'jane@acme.com' }) as Employee;
      const other = mockEmployee({ id: 2, email: 'other@acme.com' }) as Employee;

      // findOne for the employee being updated
      employeeRepo.findOne
        .mockResolvedValueOnce(existing)
        // findOne checking email uniqueness
        .mockResolvedValueOnce(other);

      await expect(
        service.update(1, { email: 'other@acme.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getSalaryHistory', () => {
    it('returns salary records for an employee', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee());
      const salaries = [{ id: 1, employeeId: 1, baseSalary: 70000, currency: 'USD' }];
      salaryRepo.find.mockResolvedValue(salaries);

      const result = await service.getSalaryHistory(1);
      expect(result).toHaveLength(1);
      expect(result[0].baseSalary).toBe(70000);
    });

    it('throws NotFoundException if employee does not exist', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.getSalaryHistory(999)).rejects.toThrow(NotFoundException);
    });
  });
});
