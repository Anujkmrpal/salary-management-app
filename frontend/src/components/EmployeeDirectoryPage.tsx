import { useState } from 'react';
import { Search, Plus, Filter, ArrowLeft, ArrowRight, UserPlus, Eye, X } from 'lucide-react';
import { EmployeeForm, type EmployeeFormValues } from './EmployeeForm';
import type { Department, Employee } from '../types';

interface EmployeeDirectoryPageProps {
  employees: Employee[];
  departments: Department[];
  loading: boolean;
  page: number;
  totalPages: number;
  search: string;
  filters: { departmentId: string; country: string; employmentType: string; status: string };
  setPage: (page: number | ((prev: number) => number)) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: any | ((prev: any) => any)) => void;
  onCreateEmployee: (values: EmployeeFormValues) => Promise<void>;
  onSelectEmployee: (employee: Employee) => void;
}

export function EmployeeDirectoryPage({
  employees,
  departments,
  loading,
  page,
  totalPages,
  search,
  filters,
  setPage,
  setSearch,
  setFilters,
  onCreateEmployee,
  onSelectEmployee,
}: EmployeeDirectoryPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const countries = ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Singapore', 'Brazil', 'France', 'Netherlands'];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleFormSubmit = async (values: EmployeeFormValues) => {
    await onCreateEmployee(values);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1>Employee Directory</h1>
          <p>Search, filter, and manage profile records for the corporate workforce.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="card-panel">
        {/* Search & Filter Toolbar */}
        <div className="toolbar-flex">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filters-row">
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filters.employmentType}
              onChange={(e) => handleFilterChange('employmentType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contractor">Contractor</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div className="alert-banner info" style={{ justifyContent: 'center' }}>
              Loading corporate directory records...
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ strokeWidth: 1, marginBottom: '16px', opacity: 0.5 }} />
            <p>No matching employee profiles found.</p>
            <p style={{ fontSize: '0.85rem' }}>Try clearing or relaxing search filters.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Name / Identity</th>
                    <th>Department</th>
                    <th>Country Location</th>
                    <th>Contract Type</th>
                    <th>HR Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                      </td>
                      <td>{emp.department?.name ?? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                      <td>{emp.country}</td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>
                          {emp.employmentType}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${emp.status === 'active' ? 'active' : 'inactive'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex' }} onClick={() => onSelectEmployee(emp)}>
                          <Eye size={12} /> View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="pagination-container">
              <div className="page-info">
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (10 records per page)
              </div>
              <div className="pagination-buttons">
                <button
                  className="btn-secondary"
                  style={{ display: 'inline-flex', padding: '8px 14px' }}
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button
                  className="btn-secondary"
                  style={{ display: 'inline-flex', padding: '8px 14px' }}
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <UserPlus size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
                Add New Employee Profile
              </h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <EmployeeForm
              departments={departments}
              onSubmit={handleFormSubmit}
              submitLabel="Register Employee"
            />
          </div>
        </div>
      )}
    </div>
  );
}
