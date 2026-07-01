import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import GridOnIcon from '@mui/icons-material/GridOn';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { GridColDef } from '@mui/x-data-grid';

import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatCard from '@/components/StatCard';

import { useReports } from '@/hooks/useReports';
import { useBranches } from '@/hooks/useBranches';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import { exportApi } from '@/api/export';
import type {
  ExportFormat,
  ReportFilters,
  ReportPeriod,
  ReportRow,
} from '@/types';
import { formatCurrency, getErrorMessage } from '@/utils/format';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const PERIODS: ReportPeriod[] = ['daily', 'monthly', 'yearly'];

export default function Reports() {
  const theme = useTheme();
  const { isManager } = useAuth();
  const { data: branches = [] } = useBranches();
  const { data: users = [] } = useUsers();

  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useReports(period, filters);

  const columns: GridColDef<ReportRow>[] = [
    { field: 'period', headerName: 'Period', flex: 1, minWidth: 140 },
    {
      field: 'income',
      headerName: 'Income',
      width: 150,
      valueFormatter: (v) => formatCurrency(v as number),
    },
    {
      field: 'expense',
      headerName: 'Expense',
      width: 150,
      valueFormatter: (v) => formatCurrency(v as number),
    },
    {
      field: 'net',
      headerName: 'Net',
      width: 150,
      valueFormatter: (v) => formatCurrency(v as number),
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    setExportError(null);
    setExporting(format);
    try {
      await exportApi.download(format, filters, `report-${period}`);
    } catch (err) {
      setExportError(getErrorMessage(err, 'Export failed'));
    } finally {
      setExporting(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Reports
      </Typography>

      <Tabs
        value={period}
        onChange={(_, v: ReportPeriod) => setPeriod(v)}
        sx={{ mb: 3 }}
      >
        {PERIODS.map((p) => (
          <Tab key={p} value={p} label={p.charAt(0).toUpperCase() + p.slice(1)} />
        ))}
      </Tabs>

      {/* Filters + export */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="From"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.from ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, from: e.target.value || undefined }))
                }
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
                onChange={(e) =>
                  setFilters((f) => ({ ...f, to: e.target.value || undefined }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Category"
                fullWidth
                size="small"
                value={filters.category ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, category: e.target.value || undefined }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Branch"
                fullWidth
                size="small"
                value={filters.branch ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, branch: e.target.value || undefined }))
                }
              >
                <MenuItem value="">All</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {isManager && (
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="User"
                  fullWidth
                  size="small"
                  value={filters.userId ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, userId: e.target.value || undefined }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.displayName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({})}
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 2 }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<GridOnIcon />}
              disabled={exporting !== null}
              onClick={() => handleExport('excel')}
            >
              {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              disabled={exporting !== null}
              onClick={() => handleExport('pdf')}
            >
              {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              disabled={exporting !== null}
              onClick={() => handleExport('csv')}
            >
              {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
            </Button>
          </Stack>
          {exportError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {exportError}
            </Alert>
          )}
        </CardContent>
      </Card>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error, 'Failed to load report')}
        </Alert>
      )}

      {isLoading ? (
        <LoadingSpinner label="Building report…" />
      ) : data ? (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Total Income"
                value={formatCurrency(data.totalIncome)}
                icon={<TrendingUpIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Total Expense"
                value={formatCurrency(data.totalExpense)}
                icon={<TrendingDownIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Net"
                value={formatCurrency(data.net)}
                icon={<ShowChartIcon />}
                color={data.net >= 0 ? 'info' : 'error'}
              />
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ width: '100%', height: 340 }}>
                <ResponsiveContainer>
                  <BarChart data={data.rows}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="period" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RTooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill={theme.palette.success.main}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill={theme.palette.warning.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <DataTable
                rows={data.rows.map((r, i) => ({ id: i, ...r }))}
                columns={columns}
                height={420}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );
}
