import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';
import { useAuth } from '@/context/AuthContext';

const KEY = 'pettyCashBalance';

export function usePettyCashBalance() {
  const { isManager } = useAuth();
  return useQuery({
    queryKey: [KEY],
    queryFn: () => transactionsApi.pettyCashBalance(),
    enabled: !isManager,
  });
}

export function useInvalidatePettyCashBalance() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}
