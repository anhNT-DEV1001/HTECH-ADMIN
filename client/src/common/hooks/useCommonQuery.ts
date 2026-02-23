import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useCommonQuery = <TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn">
) => {
  return useQuery<TData, Error, TData>({
    queryKey,
    queryFn,
    ...options,
  });
};
