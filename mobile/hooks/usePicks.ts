import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';

export function useSportPrefs() {
  return useQuery({
    queryKey: ['sportPrefs'],
    queryFn: () => storage.getSportPrefs(),
    staleTime: Infinity,
  });
}

export function useTodaysPicks() {
  return useQuery({
    queryKey: ['picks', 'today'],
    queryFn: () => api.picks.today(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });
}

export function useArchive(sport?: string, page = 1) {
  return useQuery({
    queryKey: ['picks', 'archive', sport, page],
    queryFn: () => api.picks.archive({ sport, page }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.stats.get(),
    staleTime: 1000 * 60 * 10,
  });
}
