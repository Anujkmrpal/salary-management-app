import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Employee, EmploymentType, EmployeeStatus, Gender } from '../employees/employee.entity';
import { Department } from '../departments/department.entity';
import { Salary } from '../salaries/salary.entity';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Legal',
  'Operations',
  'Customer Success',
  'Data Science',
  'DevOps',
];

const COUNTRIES = [
  { name: 'United States', currency: 'USD', salaryMin: 60000, salaryMax: 180000 },
  { name: 'India', currency: 'INR', salaryMin: 800000, salaryMax: 4000000 },
  { name: 'United Kingdom', currency: 'GBP', salaryMin: 40000, salaryMax: 130000 },
  { name: 'Germany', currency: 'EUR', salaryMin: 45000, salaryMax: 120000 },
  { name: 'Canada', currency: 'CAD', salaryMin: 55000, salaryMax: 150000 },
  { name: 'Australia', currency: 'AUD', salaryMin: 65000, salaryMax: 160000 },
  { name: 'Singapore', currency: 'SGD', salaryMin: 60000, salaryMax: 160000 },
  { name: 'Brazil', currency: 'BRL', salaryMin: 60000, salaryMax: 300000 },
  { name: 'France', currency: 'EUR', salaryMin: 38000, salaryMax: 110000 },
  { name: 'Netherlands', currency: 'EUR', salaryMin: 42000, salaryMax: 120000 },
];

const EMPLOYMENT_TYPES = [
  { type: EmploymentType.FULL_TIME, weight: 0.75 },
  { type: EmploymentType.PART_TIME, weight: 0.1 },
  { type: EmploymentType.CONTRACTOR, weight: 0.15 },
];

const GENDERS = [
  { value: Gender.MALE, weight: 0.48 },
  { value: Gender.FEMALE, weight: 0.48 },
  { value: Gender.NON_BINARY, weight: 0.04 },
];

function weightedRandom<T>(items: { weight: number; value?: T; type?: T }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return (item.value ?? item.type) as T;
  }
  return (items[items.length - 1].value ?? items[items.length - 1].type) as T;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Salary)
    private readonly salaryRepo: Repository<Salary>,
    private readonly dataSource: DataSource,
  ) {}

  async isSeeded(): Promise<boolean> {
    const count = await this.employeeRepo.count();
    return count >= 1000;
  }

  async run(): Promise<{ message: string; count: number }> {
    if (await this.isSeeded()) {
      const count = await this.employeeRepo.count();
      return { message: 'Database already seeded', count };
    }

    this.logger.log('Starting seed of 10,000 employees...');

    // Create departments
    const departments: Department[] = [];
    for (const name of DEPARTMENTS) {
      let dept = await this.departmentRepo.findOne({ where: { name } });
      if (!dept) {
        dept = await this.departmentRepo.save(this.departmentRepo.create({ name }));
      }
      departments.push(dept);
    }

    const BATCH_SIZE = 500;
    const TOTAL = 10000;
    const usedEmails = new Set<string>();

    for (let batch = 0; batch < TOTAL / BATCH_SIZE; batch++) {
      const employees: Employee[] = [];
      const salaries: Salary[] = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        const employmentType = weightedRandom<string>(EMPLOYMENT_TYPES as any);
        const gender = weightedRandom<string>(GENDERS as any);

        // Unique email
        let email: string;
        let attempts = 0;
        do {
          const firstName = faker.person.firstName();
          const lastName = faker.person.lastName();
          email = faker.internet
            .email({ firstName, lastName, provider: 'acme.com' })
            .toLowerCase();
          attempts++;
        } while (usedEmails.has(email) && attempts < 10);
        usedEmails.add(email);

        const hireDate = faker.date
          .between({ from: '2010-01-01', to: '2025-12-31' })
          .toISOString()
          .split('T')[0];

        const status =
          Math.random() > 0.1 ? EmployeeStatus.ACTIVE : EmployeeStatus.INACTIVE;

        const emp = this.employeeRepo.create({
          name: faker.person.fullName(),
          email,
          gender,
          departmentId: department.id,
          country: country.name,
          employmentType,
          status,
          hireDate,
        });
        employees.push(emp);
      }

      const savedEmployees = await this.employeeRepo.save(employees);

      // Create 1-3 salary records per employee (history)
      for (const emp of savedEmployees) {
        const country = COUNTRIES.find((c) => c.name === emp.country) ?? COUNTRIES[0];
        const numSalaries = Math.floor(Math.random() * 3) + 1;

        let baseSalary = Math.round(
          country.salaryMin + Math.random() * (country.salaryMax - country.salaryMin),
        );

        // Oldest salary first, each increment ~5-15%
        const startYear = parseInt(emp.hireDate.split('-')[0]);
        for (let s = 0; s < numSalaries; s++) {
          const effectiveYear = startYear + s;
          if (effectiveYear > 2025) break;

          const effectiveDate = `${effectiveYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`;

          salaries.push(
            this.salaryRepo.create({
              employeeId: emp.id,
              baseSalary,
              currency: country.currency,
              effectiveDate,
              notes: s === 0 ? 'Initial salary' : `Increment ${s}`,
            }),
          );

          // increment for next entry
          baseSalary = Math.round(baseSalary * (1 + 0.05 + Math.random() * 0.1));
        }
      }

      await this.salaryRepo.save(salaries);
      this.logger.log(`Seeded batch ${batch + 1}/${TOTAL / BATCH_SIZE}`);
    }

    const finalCount = await this.employeeRepo.count();
    this.logger.log(`Seeding complete. Total employees: ${finalCount}`);
    return { message: 'Seeding complete', count: finalCount };
  }
}
