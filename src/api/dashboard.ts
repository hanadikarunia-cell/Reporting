import { axiosClient } from './axiosClient';
import type { DashboardSummary } from '@/types';

export const dashboardApi = {
  async get(params?: { from?: string; to?: string; branch?: string }): Promise<DashboardSummary> {
    const { data } = await axiosClient.get<DashboardSummary>('/dashboard', { params });
    return data;
  },
};
