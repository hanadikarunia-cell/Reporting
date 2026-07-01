import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';

export function useDashboard(params?: { from?: string; to?: string; branch?: string }) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => dashboardApi.get(params),
  });
}
