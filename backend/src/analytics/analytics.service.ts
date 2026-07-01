import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { Salary } from '../salaries/salary.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Salary)
    private readonly salaryRepo: Repository<Salary>,
  ) {}

  async getSummary() {
    const totalEmployees = await this.employeeRepo.count();
    const activeEmployees = await this.employeeRepo.count({ where: { status: 'active' } });

    // Latest salary per employee via subquery
    const payrollResult = await this.salaryRepo
      .createQueryBuilder('s')
      .select('SUM(s.baseSalary)', 'totalPayroll')
      .addSelect('AVG(s.baseSalary)', 'avgSalary')
      .addSelect('COUNT(DISTINCT s.employeeId)', 'employeesWithSalary')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('MAX(s2.effectiveDate)')
          .from(Salary, 's2')
          .where('s2.employeeId = s.employeeId')
          .getQuery();
        return `s.effectiveDate = ${sub}`;
      })
      .getRawOne();

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      totalMonthlyPayroll: Math.round(Number(payrollResult?.totalPayroll ?? 0)),
      averageSalary: Math.round(Number(payrollResult?.avgSalary ?? 0)),
      employeesWithSalary: Number(payrollResult?.employeesWithSalary ?? 0),
    };
  }

  async getByDepartment() {
    const rows = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoin('e.department', 'dept')
      .leftJoin(
        (qb) =>
          qb
            .select('s.employeeId', 'empId')
            .addSelect('MAX(s.effectiveDate)', 'maxDate')
            .from(Salary, 's')
            .groupBy('s.employeeId'),
        'latest',
        'latest.empId = e.id',
      )
      .leftJoin(
        Salary,
        's',
        's.employeeId = e.id AND s.effectiveDate = latest.maxDate',
      )
      .select('dept.name', 'department')
      .addSelect('COUNT(e.id)', 'headcount')
      .addSelect('ROUND(AVG(s.baseSalary), 2)', 'avgSalary')
      .addSelect('SUM(s.baseSalary)', 'totalPayroll')
      .addSelect('s.currency', 'currency')
      .groupBy('dept.name')
      .addGroupBy('s.currency')
      .orderBy('headcount', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      department: r.department ?? 'Unassigned',
      headcount: Number(r.headcount),
      avgSalary: Math.round(Number(r.avgSalary ?? 0)),
      totalPayroll: Math.round(Number(r.totalPayroll ?? 0)),
      currency: r.currency ?? 'USD',
    }));
  }

  async getByCountry() {
    const rows = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoin(
        (qb) =>
          qb
            .select('s.employeeId', 'empId')
            .addSelect('MAX(s.effectiveDate)', 'maxDate')
            .from(Salary, 's')
            .groupBy('s.employeeId'),
        'latest',
        'latest.empId = e.id',
      )
      .leftJoin(
        Salary,
        's',
        's.employeeId = e.id AND s.effectiveDate = latest.maxDate',
      )
      .select('e.country', 'country')
      .addSelect('COUNT(e.id)', 'headcount')
      .addSelect('ROUND(AVG(s.baseSalary), 2)', 'avgSalary')
      .addSelect('s.currency', 'currency')
      .groupBy('e.country')
      .addGroupBy('s.currency')
      .orderBy('headcount', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      country: r.country,
      headcount: Number(r.headcount),
      avgSalary: Math.round(Number(r.avgSalary ?? 0)),
      currency: r.currency ?? 'USD',
    }));
  }

  async getSalaryDistribution() {
    // Distribution buckets for salary histogram
    const rows = await this.salaryRepo
      .createQueryBuilder('s')
      .select('s.employeeId', 'empId')
      .addSelect('MAX(s.effectiveDate)', 'maxDate')
      .addSelect('s.baseSalary', 'salary')
      .addSelect('s.currency', 'currency')
      .groupBy('s.employeeId')
      .addGroupBy('s.currency')
      .getRawMany();

    const bands = [
      { label: '0–25k', min: 0, max: 25000 },
      { label: '25k–50k', min: 25000, max: 50000 },
      { label: '50k–75k', min: 50000, max: 75000 },
      { label: '75k–100k', min: 75000, max: 100000 },
      { label: '100k–150k', min: 100000, max: 150000 },
      { label: '150k+', min: 150000, max: Infinity },
    ];

    return bands.map((band) => ({
      label: band.label,
      count: rows.filter(
        (r) => Number(r.salary) >= band.min && Number(r.salary) < band.max,
      ).length,
    }));
  }

  async getByEmploymentType() {
    const rows = await this.employeeRepo
      .createQueryBuilder('e')
      .select('e.employmentType', 'employmentType')
      .addSelect('COUNT(e.id)', 'headcount')
      .groupBy('e.employmentType')
      .getRawMany();

    return rows.map((r) => ({
      employmentType: r.employmentType,
      headcount: Number(r.headcount),
    }));
  }

  async getByGender() {
    const rows = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoin(
        (qb) =>
          qb
            .select('s.employeeId', 'empId')
            .addSelect('MAX(s.effectiveDate)', 'maxDate')
            .from(Salary, 's')
            .groupBy('s.employeeId'),
        'latest',
        'latest.empId = e.id',
      )
      .leftJoin(
        Salary,
        's',
        's.employeeId = e.id AND s.effectiveDate = latest.maxDate',
      )
      .select('e.gender', 'gender')
      .addSelect('COUNT(e.id)', 'headcount')
      .addSelect('ROUND(AVG(s.baseSalary), 2)', 'avgSalary')
      .addSelect('s.currency', 'currency')
      .groupBy('e.gender')
      .addGroupBy('s.currency')
      .orderBy('gender', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      gender: r.gender ?? 'Unassigned',
      headcount: Number(r.headcount),
      avgSalary: Math.round(Number(r.avgSalary ?? 0)),
      currency: r.currency ?? 'USD',
    }));
  }
}
