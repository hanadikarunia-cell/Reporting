import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import FileUpload from '@/components/FileUpload';
import { useBranches } from '@/hooks/useBranches';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import type { Attachment, Transaction, TransactionInput } from '@/types';
import { getErrorMessage } from '@/utils/format';

const schema = z.object({
  type: z.enum(['Income', 'Expense']),
  category: z.string().min(1, 'Category is required').max(80),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  date: z.string().min(1, 'Date is required'),
  branchId: z.string().min(1, 'Branch is required'),
  description: z.string().max(500).optional(),
  reference: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = [
  'Sales',
  'Services',
  'Interest',
  'Salaries',
  'Rent',
  'Utilities',
  'Supplies',
  'Marketing',
  'Travel',
  'Taxes',
  'Other',
];

interface Props {
  open: boolean;
  transaction: Transaction | null; // null = create mode
  onClose: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionFormDialog({ open, transaction, onClose }: Props) {
  const isEdit = !!transaction;
  const { data: branches = [] } = useBranches();
  const createMut = useCreateTransaction();
  const updateMut = useUpdateTransaction();

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'Expense',
      category: '',
      amount: 0,
      date: todayIso(),
      branchId: '',
      description: '',
      reference: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      transaction
        ? {
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            date: transaction.date.slice(0, 10),
            branchId: transaction.branchId,
            description: transaction.description ?? '',
            reference: transaction.reference ?? '',
          }
        : {
            type: 'Expense',
            category: '',
            amount: 0,
            date: todayIso(),
            branchId: branches[0]?.id ?? '',
            description: '',
            reference: '',
          },
    );
    setAttachments(transaction?.attachments ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, branches.length]);

  const serverError =
    (createMut.isError && getErrorMessage(createMut.error)) ||
    (updateMut.isError && getErrorMessage(updateMut.error)) ||
    null;

  const onSubmit = async (values: FormValues) => {
    const payload: TransactionInput = {
      ...values,
      description: values.description || undefined,
      reference: values.reference || undefined,
      attachmentIds: attachments.map((a) => a.id),
    };
    if (isEdit && transaction) {
      await updateMut.mutateAsync({ id: transaction.id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Type"
                    fullWidth
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="Income">Income</MenuItem>
                    <MenuItem value="Expense">Expense</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Category"
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                {...register('amount')}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('date')}
                error={!!errors.date}
                helperText={errors.date?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="branchId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Branch"
                    fullWidth
                    error={!!errors.branchId}
                    helperText={errors.branchId?.message}
                  >
                    {branches.length === 0 && (
                      <MenuItem value="" disabled>
                        No branches available
                      </MenuItem>
                    )}
                    {branches.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reference"
                fullWidth
                {...register('reference')}
                error={!!errors.reference}
                helperText={errors.reference?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Attachments
              </Typography>
              <FileUpload attachments={attachments} onChange={setAttachments} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
