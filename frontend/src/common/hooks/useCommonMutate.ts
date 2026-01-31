import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

export const useCommonMutate = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
): UseMutationResult<TData, Error, TVariables> => {
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    ...options,
  });
};
