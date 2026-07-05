import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from '../analytics.service';
import { Employee } from '../../employees/employee.entity';
import { Salary } from '../../salaries/salary.entity';

const makeEmployeeRepo = (overrides = {}) => ({
  count: jest.fn().mockResolvedValue(0),
  createQueryBuilder: jest.fn(),
  ...overrides,
});

const makeSalaryRepo = (overrides = {}) => ({
  createQueryBuilder: jest.fn(),
  ...overrides,
});

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let employeeRepo: ReturnType<typeof makeEmployeeRepo>;
  let salaryRepo: ReturnType<typeof makeSalaryRepo>;

  beforeEach(async () => {
    employeeRepo = makeEmployeeRepo();
    salaryRepo = makeSalaryRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Employee), useValue: employeeRepo },
        { provide: getRepositoryToken(Salary), useValue: salaryRepo },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('returns summary metrics for the organization', async () => {
    employeeRepo.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(8);

    const salaryQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        totalPayroll: '1200000',
        avgSalary: '120000',
        employeesWithSalary: '10',
      }),
    };
    salaryRepo.createQueryBuilder.mockReturnValue(salaryQueryBuilder);

    const result = await service.getSummary();

    expect(result.totalEmployees).toBe(10);
    expect(result.activeEmployees).toBe(8);
    expect(result.inactiveEmployees).toBe(2);
    expect(result.totalMonthlyPayroll).toBe(1200000);
    expect(result.averageSalary).toBe(120000);
    expect(result.employeesWithSalary).toBe(10);
  });

  it('returns department analytics with rounded salary values', async () => {
    const employeeQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          department: 'Engineering',
          headcount: '5',
          avgSalary: '92500.5',
          totalPayroll: '462500.25',
          currency: 'USD',
        },
      ]),
    };
    employeeRepo.createQueryBuilder.mockReturnValue(employeeQueryBuilder);

    const result = await service.getByDepartment();

    expect(result).toEqual([
      {
        department: 'Engineering',
        headcount: 5,
        avgSalary: 92501,
        totalPayroll: 462500,
        currency: 'USD',
      },
    ]);
  });
});
