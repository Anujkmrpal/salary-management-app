import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Users, BarChart3, Database, UserCheck, AlertCircle } from 'lucide-react';
import { DashboardPage } from './components/DashboardPage';
import { EmployeeDirectoryPage } from './components/EmployeeDirectoryPage';
import { EmployeeDetailPage } from './components/EmployeeDetailPage';
import { AnalyticsHubPage } from './components/AnalyticsHubPage';
import {
  createEmployee,
  createSalary,
  getAnalyticsByCountry,
  getAnalyticsByDepartment,
  getAnalyticsByEmploymentType,
  getAnalyticsByGender,
  getAnalyticsSummary,
  getDepartments,
  getEmployee,
  getEmployees,
  getSalaryDistribution,
  getSalaryHistory,
  seedDatabase,
  updateEmployee,
  type EmployeePayload,
  type SalaryPayload,
} from './api';
import type { Department, Employee, Salary, GenderAnalyticsRow } from './types';
import type { EmployeeFormValues } from './components/EmployeeForm';
import type { SalaryFormValues } from './components/SalaryForm';
import './App.css';

type Page = 'dashboard' | 'directory' | 'detail' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<{
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalMonthlyPayroll: number;
    averageSalary: number;
    employeesWithSalary: number;
  } | null>(null);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [salaryDistribution, setSalaryDistribution] = useState<any[]>([]);
  const [employmentBreakdown, setEmploymentBreakdown] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<GenderAnalyticsRow[]>([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ departmentId: '', country: '', employmentType: '', status: '' });
  const [totalPages, setTotalPages] = useState(1);

  // Load all initial lookup tables, metrics and directory page data
  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [
        employeeResponse,
        departmentResponse,
        summaryResponse,
        deptAnalytics,
        countryAnalytics,
        dist,
        employment,
        genderAnalytics,
      ] = await Promise.all([
        getEmployees({
          page,
          limit: 10,
          search,
          departmentId: filters.departmentId ? Number(filters.departmentId) : undefined,
          country: filters.country || undefined,
          employmentType: filters.employmentType || undefined,
          status: filters.status || undefined,
        }),
        getDepartments(),
        getAnalyticsSummary(),
        getAnalyticsByDepartment(),
        getAnalyticsByCountry(),
        getSalaryDistribution(),
        getAnalyticsByEmploymentType(),
        getAnalyticsByGender(),
      ]);

      setEmployees(employeeResponse.data);
      setTotalPages(employeeResponse.meta.totalPages);
      setDepartments(departmentResponse);
      setSummary(summaryResponse);
      setDepartmentData(deptAnalytics);
      setCountryData(countryAnalytics);
      setSalaryDistribution(dist);
      setEmploymentBreakdown(employment);
      setGenderData(genderAnalytics);
      setError(null);
    } catch (err) {
      setError('Unable to reach the backend API. Please make sure the NestJS backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [page, search, filters.departmentId, filters.country, filters.employmentType, filters.status]);

  // Create an employee from Directory Page Modal
  const handleCreateEmployee = async (values: EmployeeFormValues) => {
    const payload: EmployeePayload = {
      name: values.name,
      email: values.email,
      gender: values.gender || undefined,
      departmentId: values.departmentId ? Number(values.departmentId) : undefined,
      country: values.country,
      employmentType: values.employmentType,
      status: values.status,
      hireDate: values.hireDate,
    };
    try {
      await createEmployee(payload);
      await loadData(true);
    } catch (err) {
      setError('Failed to create new employee.');
    }
  };

  // Update employee from Detail View Edit Profile Form
  const handleUpdateEmployee = async (values: EmployeeFormValues) => {
    if (!selectedEmployee) return;
    const payload: EmployeePayload = {
      name: values.name,
      email: values.email,
      gender: values.gender || undefined,
      departmentId: values.departmentId ? Number(values.departmentId) : undefined,
      country: values.country,
      employmentType: values.employmentType,
      status: values.status,
      hireDate: values.hireDate,
    };
    try {
      const updated = await updateEmployee(selectedEmployee.id, payload);
      // Fetch full details of updated employee
      const detail = await getEmployee(updated.id);
      setSelectedEmployee(detail);
      await loadData(true);
    } catch (err) {
      setError('Failed to update employee profile.');
    }
  };

  // Record a salary adjustment from Detail View Form
  const handleAddSalaryAdjustment = async (values: SalaryFormValues) => {
    if (!selectedEmployee) return;
    const payload: SalaryPayload = {
      employeeId: selectedEmployee.id,
      baseSalary: values.baseSalary,
      currency: values.currency,
      effectiveDate: values.effectiveDate,
      notes: values.notes,
    };
    try {
      await createSalary(payload);
      const history = await getSalaryHistory(selectedEmployee.id);
      setSalaryHistory(history);
      await loadData(true);
    } catch (err) {
      setError('Failed to append salary adjustment entry.');
    }
  };

  // Select an employee to inspect profile and salary adjustments
  const handleSelectEmployee = async (employee: Employee) => {
    try {
      setLoading(true);
      const detail = await getEmployee(employee.id);
      const history = await getSalaryHistory(employee.id);
      setSelectedEmployee(detail);
      setSalaryHistory(history);
      setCurrentPage('detail');
      setError(null);
    } catch (err) {
      setError('Failed to fetch detailed employee profile info.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Database seed process
  const handleSeed = async () => {
    try {
      setSeeding(true);
      setError(null);
      const result = await seedDatabase();
      alert(`Database successfully populated: ${result.message} (${result.count} employees loaded)`);
      await loadData();
    } catch (err) {
      setError('Failed to seed the database.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation Panel */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div className="brand-text">ACME Salary</div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'directory' ? 'active' : ''}`}
            onClick={() => setCurrentPage('directory')}
          >
            <Users size={20} />
            <span>Directory</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <BarChart3 size={20} />
            <span>Analytics Hub</span>
          </button>
          {selectedEmployee && (
            <button
              className={`nav-item ${currentPage === 'detail' ? 'active' : ''}`}
              onClick={() => setCurrentPage('detail')}
            >
              <UserCheck size={20} />
              <span>Detail: {selectedEmployee.name.split(' ')[0]}</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="seed-btn" onClick={() => void handleSeed()} disabled={seeding}>
            <Database size={16} />
            <span>{seeding ? 'Seeding...' : 'Seed Sample Data'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace Panel */}
      <main className="main-content">
        {error && (
          <div className="alert-banner error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            summary={summary}
            countryData={countryData}
            employmentBreakdown={employmentBreakdown}
            onNavigateToDirectory={() => setCurrentPage('directory')}
          />
        )}

        {currentPage === 'directory' && (
          <EmployeeDirectoryPage
            employees={employees}
            departments={departments}
            loading={loading}
            page={page}
            totalPages={totalPages}
            search={search}
            filters={filters}
            setPage={setPage}
            setSearch={setSearch}
            setFilters={setFilters}
            onCreateEmployee={handleCreateEmployee}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {currentPage === 'detail' && selectedEmployee && (
          <EmployeeDetailPage
            employee={selectedEmployee}
            departments={departments}
            salaryHistory={salaryHistory}
            onBackToDirectory={() => setCurrentPage('directory')}
            onUpdateProfile={handleUpdateEmployee}
            onAddSalaryAdjustment={handleAddSalaryAdjustment}
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsHubPage
            departmentData={departmentData}
            countryData={countryData}
            salaryDistribution={salaryDistribution}
            genderData={genderData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
