import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import type {
  GridColDef,
  GridPaginationModel,
} from '@mui/x-data-grid';

import DataTable from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { StatusChip, TypeChip } from '@/components/StatusChip';
import TransactionFormDialog from './transactions/TransactionFormDialog';

import {
  useApproveTransaction,
  useDeleteTransaction,
  useRejectTransaction,
  useTransactions,
} from '@/hooks/useTransactions';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/context/AuthContext';
import type {
  ApprovalStatus,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '@/types';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils/format';

const TYPES: TransactionType[] = ['Income', 'Expense'];
const STATUSES: ApprovalStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

export default function Transactions() {
  const { isManager } = useAuth();
  const { data: branches = [] } = useBranches();

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    pageSize: 25,
  });

  const { data, isLoading, isError, error, isFetching } = useTransactions(filters);

  const approveMut = useApproveTransaction();
  const rejectMut = useRejectTransaction();
  const deleteMut = useDeleteTransaction();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Transaction | null>(null);

  const paginationModel: GridPaginationModel = {
    page: (filters.page ?? 1) - 1,
    pageSize: filters.pageSize ?? 25,
  };

  const updateFilter = (patch: Partial<TransactionFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  const canEdit = (t: Transaction) => {
    // Users cannot edit approved transactions; managers can always edit.
    if (isManager) return true;
    return t.status !== 'Approved';
  };

  const columns: GridColDef<Transaction>[] = useMemo(
    () => [
      {
        field: 'date',
        headerName: 'Date',
        width: 120,
        valueFormatter: (value) => formatDate(value as string),
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 110,
        renderCell: (params) => <TypeChip type={params.row.type} />,
      },
      { field: 'category', headerName: 'Category', width: 140 },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 130,
        valueFormatter: (value) => formatCurrency(value as number),
      },
      { field: 'branchName', headerName: 'Branch', width: 140 },
      { field: 'userName', headerName: 'User', width: 140 },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => <StatusChip status={params.row.status} />,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const t = params.row;
          const pendingApproval = t.status === 'Submitted' || t.status === 'Draft';
          return (
            <Stack direction="row" spacing={0.5}>
              {isManager && pendingApproval && (
                <>
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => approveMut.mutate(t.id)}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setRejectTarget(t)}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip title={canEdit(t) ? 'Edit' : 'Approved items are locked'}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!canEdit(t)}
                    onClick={() => {
                      setEditing(t);
                      setFormOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              {isManager && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget(t)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isManager, approveMut],
  );

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          New Transaction
        </Button>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Type"
                fullWidth
                size="small"
                value={filters.type ?? ''}
                onChange={(e) =>
                  updateFilter({ type: (e.target.value || undefined) as TransactionType })
                }
              >
                <MenuItem value="">All</MenuItem>
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Status"
                fullWidth
                size="small"
                value={filters.status ?? ''}
                onChange={(e) =>
                  updateFilter({ status: (e.target.value || undefined) as ApprovalStatus })
                }
              >
                <MenuItem value="">All</MenuItem>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Branch"
                fullWidth
                size="small"
                value={filters.branch ?? ''}
                onChange={(e) => updateFilter({ branch: e.target.value || undefined })}
              >
                <MenuItem value="">All</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Category"
                fullWidth
                size="small"
                value={filters.category ?? ''}
                onChange={(e) => updateFilter({ category: e.target.value || undefined })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="From"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.from ?? ''}
                onChange={(e) => updateFilter({ from: e.target.value || undefined })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="To"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.to ?? ''}
                onChange={(e) => updateFilter({ to: e.target.value || undefined })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error, 'Failed to load transactions')}
        </Alert>
      )}

      <Card>
        <CardContent>
          <DataTable
            rows={data?.items ?? []}
            columns={columns}
            loading={isLoading || isFetching}
            getRowId={(row) => row.id}
            paginationMode="server"
            rowCount={data?.total ?? 0}
            paginationModel={paginationModel}
            onPaginationModelChange={(model) =>
              setFilters((prev) => ({
                ...prev,
                page: model.page + 1,
                pageSize: model.pageSize,
              }))
            }
          />
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={formOpen}
        transaction={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete transaction"
        message={`Delete the ${deleteTarget?.type.toLowerCase()} of ${
          deleteTarget ? formatCurrency(deleteTarget.amount) : ''
        }? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMut.isPending}
        onConfirm={async () => {
          if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject transaction"
        message="Reject this transaction? The submitter will be notified."
        confirmLabel="Reject"
        confirmColor="error"
        loading={rejectMut.isPending}
        onConfirm={async () => {
          if (rejectTarget) await rejectMut.mutateAsync({ id: rejectTarget.id });
          setRejectTarget(null);
        }}
        onClose={() => setRejectTarget(null)}
      />
    </Box>
  );
}
