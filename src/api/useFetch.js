import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import memberService from './memberService';

/**
 * 멤버 목록 조회 훅
 * @returns {QueryResult} React Query 결과
 */
export function useFetchItems({
  requireAuth = false,
  endpoint = '/api/members',
  staleTime = 1000 * 60,
  cacheTime,
  version
} = {}) {
  return useQuery({
    queryKey: ['items', endpoint, requireAuth, version],
    queryFn: async () => {
      // 환경에 따라 로컬 또는 서버 API 사용
      const isDevelopment = process.env.NODE_ENV === 'development';
      const useLocalData = process.env.REACT_APP_USE_LOCAL_DATA === 'true';

      // 로컬 데이터 사용 모드
      if (isDevelopment && useLocalData) {
        return await memberService.getItems({ auth: requireAuth, endpoint });
      }

      // 서버 API 사용
      return await memberService.getItems({ auth: requireAuth, endpoint });
    },
    staleTime,
    cacheTime
  });
}

/**
 * 특정 멤버 조회 훅
 * @param {string|number} id - 멤버 ID
 * @returns {QueryResult} React Query 결과
 */
export function useFetchItem(id, { requireAuth = true } = {}) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: async () => {
      return await memberService.getItemById(id, { auth: requireAuth });
    },
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 1000 * 60,
  });
}

/**
 * 멤버 생성 훅
 * @returns {MutationResult} React Query Mutation 결과
 */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberData) => memberService.createItem(memberData),
    onSuccess: () => {
      // 생성 성공 시 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

/**
 * 멤버 업데이트 훅
 * @returns {MutationResult} React Query Mutation 결과
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => memberService.updateItem(id, data),
    onSuccess: (_, { id }) => {
      // 업데이트 성공 시 목록 및 해당 항목 갱신
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', id] });
    },
  });
}

/**
 * 멤버 삭제 훅
 * @returns {MutationResult} React Query Mutation 결과
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => memberService.deleteItem(id),
    onSuccess: () => {
      // 삭제 성공 시 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

/**
 * 필터링된 멤버 목록 조회 훅
 * @param {Object} filters - 필터 조건
 * @returns {QueryResult} React Query 결과
 */
export function useFetchFilteredItems(filters, { requireAuth = false } = {}) {
  return useQuery({
    queryKey: ['items', 'filtered', filters],
    queryFn: async () => {
      return await memberService.getFilteredItems(filters, { auth: requireAuth });
    },
    staleTime: 1000 * 60,
    enabled: !!filters, // 필터가 있을 때만 실행
  });
}
