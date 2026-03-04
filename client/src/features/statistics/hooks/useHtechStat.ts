"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCommonQuery } from "@/common/hooks";
import { htechStatService } from "../services";

export const useHtechStat = () => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["htech", "getHtechStat"];

  const htechStatQuery = useCommonQuery(
    QUERY_KEY,
    () => htechStatService.getHtechStat(),
    { placeholderData: (prev) => prev },
  );

  return {
    htechStatData: htechStatQuery.data,
    isLoading: htechStatQuery.isLoading,
    isFetching: htechStatQuery.isFetching,
    htechStatQuery,
  };
};

