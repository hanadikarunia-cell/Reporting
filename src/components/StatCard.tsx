import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
}: StatCardProps) {
  const theme = useTheme();
  const paletteColor = theme.palette[color].main;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: alpha(paletteColor, 0.15),
            color: paletteColor,
            width: 52,
            height: 52,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography variant="h5" noWrap>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
