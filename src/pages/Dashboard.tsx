import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { StatusChip, TypeChip } from '@/components/StatusChip';
import DataTable from '@/components/DataTable';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils/format';
import type { GridColDef } from '@mui/x-data-grid';
import type { Transaction } from '@/types';

const PIE_COLORS = ['#1976d2', '#00897b', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

export default function Dashboard() {
  const theme = useTheme();
  const { data, isLoading, isError, error } = useDashboard();

  // Merge monthly income + expense into one series keyed by month.
  const monthlySeries = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { month: string; income: number; expense: number }>();
    data.monthlyIncome.forEach((p) =>
      map.set(p.month, { month: p.month, income: p.amount, expense: 0 }),
    );
    data.monthlyExpense.forEach((p) => {
      const existing = map.get(p.month);
      if (existing) existing.expense = p.amount;
      else map.set(p.month, { month: p.month, income: 0, expense: p.amount });
    });
    return Array.from(map.values());
  }, [data]);

  const recentColumns: GridColDef<Transaction>[] = [
    {
      field: 'date',
      headerName: 'Date',
      width: 130,
      valueFormatter: (value) => formatDate(value as string),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => <TypeChip type={params.row.type} />,
    },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 140 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      valueFormatter: (value) => formatCurrency(value as number),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
  ];

  if (isLoading) return <LoadingSpinner label="Loading dashboard…" fullHeight />;
  if (isError)
    return <Alert severity="error">{getErrorMessage(error, 'Failed to load dashboard')}</Alert>;
  if (!data) return null;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Income"
            value={formatCurrency(data.totalIncome)}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Expenses"
            value={formatCurrency(data.totalExpenses)}
            icon={<TrendingDownIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Balance"
            value={formatCurrency(data.balance)}
            icon={<AccountBalanceIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Net Profit"
            value={formatCurrency(data.netProfit)}
            icon={<SavingsIcon />}
            color={data.netProfit >= 0 ? 'info' : 'error'}
          />
        </Grid>

        {/* Monthly income vs expense */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Income vs Expense (Monthly)" />
            <CardContent>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <ComposedChart data={monthlySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RTooltip
                      contentStyle={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Legend />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill={theme.palette.success.main}
                      radius={[4, 4, 0, 0]}
                      barSize={22}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill={theme.palette.warning.main}
                      radius={[4, 4, 0, 0]}
                      barSize={22}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income trend"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top categories pie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Top Categories" />
            <CardContent>
              <Box sx={{ width: '100%', height: 320 }}>
                {data.topCategories.length === 0 ? (
                  <Typography color="text.secondary">No data available.</Typography>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.topCategories}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label={(entry) => entry.category}
                      >
                        {data.topCategories.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RTooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense breakdown bar (secondary chart to satisfy bar+line requirement) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Expense by Month" />
            <CardContent>
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={data.monthlyExpense}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RTooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar
                      dataKey="amount"
                      name="Expense"
                      fill={theme.palette.warning.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent transactions */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recent Transactions" />
            <CardContent>
              <DataTable
                rows={data.recentTransactions}
                columns={recentColumns}
                height={360}
                hideFooter
                getRowId={(row) => row.id}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
