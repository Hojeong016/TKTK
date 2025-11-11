import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blacklistService from './blacklistService';

export function useFetchBlacklist() {
  return useQuery({
    queryKey: ['blacklist'],
    queryFn: () => blacklistService.getEntries(),
    staleTime: 1000 * 60,
  });
}

function useInvalidateBlacklistMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
    },
  });
}

export function useWarnMember() {
  return useInvalidateBlacklistMutation(({ memberId, payload }) =>
    blacklistService.warnMember(memberId, payload)
  );
}

export function useRemoveWarning() {
  return useInvalidateBlacklistMutation(({ memberId, payload }) =>
    blacklistService.removeWarning(memberId, payload)
  );
}

export function useBlacklistMember() {
  return useInvalidateBlacklistMutation(({ memberId, payload }) =>
    blacklistService.blacklistMember(memberId, payload)
  );
}

export function useReleaseMember() {
  return useInvalidateBlacklistMutation(({ memberId, payload }) =>
    blacklistService.releaseMember(memberId, payload)
  );
}
