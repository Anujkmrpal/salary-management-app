import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const salarySchema = z.object({
  baseSalary: z.coerce.number().min(0, 'Salary must be positive'),
  currency: z.string().length(3, 'Use a 3-letter currency code (e.g. USD)'),
  effectiveDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export type SalaryFormValues = z.infer<typeof salarySchema>;

interface SalaryFormProps {
  onSubmit: (values: SalaryFormValues) => void;
  submitLabel: string;
}

export function SalaryForm({ onSubmit, submitLabel }: SalaryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema as never) as never,
    defaultValues: {
      baseSalary: 0,
      currency: 'USD',
      effectiveDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  return (
    <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group-grid">
        <div className="form-group">
          <label htmlFor="sal-amount">Base Salary Amount</label>
          <input id="sal-amount" type="number" step="0.01" placeholder="80000" {...register('baseSalary')} />
          {errors.baseSalary ? <div className="form-error">{errors.baseSalary.message}</div> : null}
        </div>
        <div className="form-group">
          <label htmlFor="sal-currency">Currency Code</label>
          <input id="sal-currency" placeholder="USD" {...register('currency')} />
          {errors.currency ? <div className="form-error">{errors.currency.message}</div> : null}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sal-date">Effective Date</label>
        <input id="sal-date" type="date" {...register('effectiveDate')} />
        {errors.effectiveDate ? <div className="form-error">{errors.effectiveDate.message}</div> : null}
      </div>

      <div className="form-group">
        <label htmlFor="sal-notes">Adjustment Notes</label>
        <input id="sal-notes" placeholder="e.g. Annual Promotion, Market Correction" {...register('notes')} />
      </div>

      <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
        {submitLabel}
      </button>
    </form>
  );
}
