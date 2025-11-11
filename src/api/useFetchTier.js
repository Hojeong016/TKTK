import { useQuery } from '@tanstack/react-query';
import tierService from './tierService';

// 티어 목록 조회
export function useFetchTiers() {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: () => tierService.getTiers(),
    staleTime: 1000 * 60,
  });
}

// 특정 티어 상세 조회
export function useFetchTierDetail(tierId) {
  return useQuery({
    queryKey: ['tiers', tierId],
    queryFn: () => tierService.getTierDetail(tierId),
    enabled: !!tierId,
    staleTime: 1000 * 60,
  });
}
