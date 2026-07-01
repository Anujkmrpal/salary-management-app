import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { SalariesModule } from './salaries/salaries.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SeedModule } from './seed/seed.module';
import { Employee } from './employees/employee.entity';
import { Department } from './departments/department.entity';
import { Salary } from './salaries/salary.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), 'data', 'acme.sqlite'),
      entities: [Employee, Department, Salary],
      synchronize: true, // auto-creates schema — fine for SQLite / dev
      logging: process.env.NODE_ENV === 'development',
    }),
    DepartmentsModule,
    EmployeesModule,
    SalariesModule,
    AnalyticsModule,
    SeedModule,
  ],
})
export class AppModule {}
