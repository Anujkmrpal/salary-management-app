import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Department } from '../types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('A valid email is required'),
  gender: z.string().optional(),
  departmentId: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contractor']),
  status: z.enum(['active', 'inactive']),
  hireDate: z.string().min(1, 'Hire date is required'),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  departments: Department[];
  initialValues?: Partial<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => void;
  submitLabel: string;
}

export function EmployeeForm({ departments, initialValues, onSubmit, submitLabel }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      email: initialValues?.email ?? '',
      gender: initialValues?.gender ?? '',
      departmentId: initialValues?.departmentId ?? '',
      country: initialValues?.country ?? '',
      employmentType: initialValues?.employmentType ?? 'full-time',
      status: initialValues?.status ?? 'active',
      hireDate: initialValues?.hireDate ?? '',
    },
  });

  return (
    <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="emp-name">Full Name</label>
        <input id="emp-name" placeholder="John Doe" {...register('name')} />
        {errors.name ? <div className="form-error">{errors.name.message}</div> : null}
      </div>

      <div className="form-group">
        <label htmlFor="emp-email">Email Address</label>
        <input id="emp-email" type="email" placeholder="john.doe@acme.com" {...register('email')} />
        {errors.email ? <div className="form-error">{errors.email.message}</div> : null}
      </div>

      <div className="form-group-grid">
        <div className="form-group">
          <label htmlFor="emp-gender">Gender</label>
          <select id="emp-gender" {...register('gender')}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="emp-dept">Department</label>
          <select id="emp-dept" {...register('departmentId')}>
            <option value="">Unassigned</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group-grid">
        <div className="form-group">
          <label htmlFor="emp-country">Country</label>
          <input id="emp-country" placeholder="United States" {...register('country')} />
          {errors.country ? <div className="form-error">{errors.country.message}</div> : null}
        </div>
        <div className="form-group">
          <label htmlFor="emp-type">Employment Type</label>
          <select id="emp-type" {...register('employmentType')}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>
      </div>

      <div className="form-group-grid">
        <div className="form-group">
          <label htmlFor="emp-status">Status</label>
          <select id="emp-status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="emp-hire">Hire Date</label>
          <input id="emp-hire" type="date" {...register('hireDate')} />
          {errors.hireDate ? <div className="form-error">{errors.hireDate.message}</div> : null}
        </div>
      </div>

      <button type="submit" className="btn-primary" style={{ marginTop: '12px', justifyContent: 'center' }}>
        {submitLabel}
      </button>
    </form>
  );
}
