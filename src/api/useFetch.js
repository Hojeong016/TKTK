import { useQuery } from '@tanstack/react-query';

// 로컬 public/data/items.json을 읽어오는 훅
export function useFetchItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/data/items.json');
      if (!res.ok) throw new Error('Failed to load items');
      return res.json();
    },
    staleTime: 1000 * 60, // 1분
  });
}