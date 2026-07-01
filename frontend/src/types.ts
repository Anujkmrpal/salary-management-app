export interface Department {
  id: number;
  name: string;
  createdAt?: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  gender?: string;
  departmentId?: number;
  department?: Department;
  country: string;
  employmentType: string;
  status: string;
  hireDate: string;
  createdAt?: string;
}

export interface Salary {
  id: number;
  employeeId: number;
  baseSalary: number;
  currency: string;
  effectiveDate: string;
  notes?: string;
  createdAt?: string;
}

export interface PaginatedEmployees {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalMonthlyPayroll: number;
  averageSalary: number;
  employeesWithSalary: number;
}

export interface AnalyticsRow {
  department?: string;
  country?: string;
  headcount: number;
  avgSalary: number;
  totalPayroll: number;
  currency: string;
}

export interface SalaryDistributionItem {
  label: string;
  count: number;
}

export interface EmploymentTypeBreakdownItem {
  employmentType: string;
  headcount: number;
}

export interface GenderAnalyticsRow {
  gender: string;
  headcount: number;
  avgSalary: number;
  currency: string;
}

