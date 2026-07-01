import Chip from '@mui/material/Chip';
import type { ApprovalStatus, TransactionType } from '@/types';

const STATUS_COLOR: Record<
  ApprovalStatus,
  'default' | 'info' | 'success' | 'error' | 'warning'
> = {
  Draft: 'default',
  Submitted: 'info',
  Approved: 'success',
  Rejected: 'error',
};

export function StatusChip({ status }: { status: ApprovalStatus }) {
  return <Chip label={status} color={STATUS_COLOR[status]} size="small" variant="filled" />;
}

export function TypeChip({ type }: { type: TransactionType }) {
  return (
    <Chip
      label={type}
      color={type === 'Income' ? 'success' : 'warning'}
      size="small"
      variant="outlined"
    />
  );
}
