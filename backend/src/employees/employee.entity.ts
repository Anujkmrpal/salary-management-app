import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Department } from '../departments/department.entity';
import { Salary } from '../salaries/salary.entity';

export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACTOR = 'contractor',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  NON_BINARY = 'Non-binary',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'int', nullable: true })
  departmentId: number;

  @ManyToOne(() => Department, (dept) => dept.employees, { eager: false })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column()
  country: string;

  @Column({
    type: 'varchar',
    default: EmploymentType.FULL_TIME,
  })
  employmentType: string;

  @Column({
    type: 'varchar',
    default: EmployeeStatus.ACTIVE,
  })
  status: string;

  @Column({ type: 'date' })
  hireDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Salary, (salary) => salary.employee)
  salaries: Salary[];
}
