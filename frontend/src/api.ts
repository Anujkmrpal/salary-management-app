import axios from 'axios';
import type {
  AnalyticsRow,
  AnalyticsSummary,
  Department,
  Employee,
  EmploymentTypeBreakdownItem,
  GenderAnalyticsRow,
  PaginatedEmployees,
  Salary,
  SalaryDistributionItem,
} from './types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  country?: string;
  employmentType?: string;
  status?: string;
}

export interface EmployeePayload {
  name: string;
  email: string;
  gender?: string;
  departmentId?: number;
  country: string;
  employmentType?: string;
  status?: string;
  hireDate: string;
}

export interface SalaryPayload {
  employeeId: number;
  baseSalary: number;
  currency: string;
  effectiveDate: string;
  notes?: string;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>('/departments');
  return data;
}

export async function getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedEmployees> {
  const { data } = await api.get<PaginatedEmployees>('/employees', { params: filters });
  return data;
}

export async function getEmployee(id: number): Promise<Employee> {
  const { data } = await api.get<Employee>(`/employees/${id}`);
  return data;
}

export async function createEmployee(payload: EmployeePayload): Promise<Employee> {
  const { data } = await api.post<Employee>('/employees', payload);
  return data;
}

export async function updateEmployee(id: number, payload: EmployeePayload): Promise<Employee> {
  const { data } = await api.put<Employee>(`/employees/${id}`, payload);
  return data;
}

export async function getSalaryHistory(id: number): Promise<Salary[]> {
  const { data } = await api.get<Salary[]>(`/employees/${id}/salary-history`);
  return data;
}

export async function createSalary(payload: SalaryPayload): Promise<Salary> {
  const { data } = await api.post<Salary>('/salaries', payload);
  return data;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>('/analytics/summary');
  return data;
}

export async function getAnalyticsByDepartment(): Promise<AnalyticsRow[]> {
  const { data } = await api.get<AnalyticsRow[]>('/analytics/by-department');
  return data;
}

export async function getAnalyticsByCountry(): Promise<AnalyticsRow[]> {
  const { data } = await api.get<AnalyticsRow[]>('/analytics/by-country');
  return data;
}

export async function getSalaryDistribution(): Promise<SalaryDistributionItem[]> {
  const { data } = await api.get<SalaryDistributionItem[]>('/analytics/salary-distribution');
  return data;
}

export async function getAnalyticsByEmploymentType(): Promise<EmploymentTypeBreakdownItem[]> {
  const { data } = await api.get<EmploymentTypeBreakdownItem[]>('/analytics/by-employment-type');
  return data;
}

export async function getAnalyticsByGender(): Promise<GenderAnalyticsRow[]> {
  const { data } = await api.get<GenderAnalyticsRow[]>('/analytics/by-gender');
  return data;
}

export async function seedDatabase(): Promise<{ message: string; count: number }> {
  const { data } = await api.post<{ message: string; count: number }>('/seed/run');
  return data;
}
