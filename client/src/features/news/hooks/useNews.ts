import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { IPaginationRequest } from "@/common/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { newsService } from "../services";
import { ICreateNews, IUpdateNews } from "../interfaces";
import { useToast } from "@/common/providers/ToastProvider";

export const useNews = (query? : IPaginationRequest) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["news" , "getNews" , query];
  const {showToast} = useToast();
  const newsQuery = useCommonQuery(
    QUERY_KEY, 
    () => newsService.getNews(query || {}),
    {placeholderData : (prev) => prev} 
  );

  const createNewsMutation = useCommonMutate(
    (body : ICreateNews) => newsService.createNews(body as any),
    {
      onSuccess : (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY[0], QUERY_KEY[1]]
        });
        showToast(data.message, 'success');
      },
      onError: (data) => {
        showToast(data.message , 'error');
      }
    }
  )

  const updateNewsMutation = useCommonMutate(
    ({body, id} : {body : IUpdateNews , id : number}) => newsService.updateNews(id, body as any),
    {
      onSuccess : (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY[0], QUERY_KEY[1]]
        });
        showToast(data.message, 'success');
      },
      onError: (data) => {
        showToast(data.message , 'error');
      }
    }
  )

  const deleteNewsMutation = useCommonMutate(
    (id : number) => newsService.deleteNews(id),
    {
      onSuccess : (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY[0], QUERY_KEY[1]]
        });
        showToast(data.message, 'success');
      },
      onError: (data) => {
        showToast(data.message , 'error');
      }
    }
  )
  return  {
    newsData : newsQuery.data,
    isLoading: newsQuery.isLoading,
    isFetching : newsQuery.isFetching,

    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
    isCreating : createNewsMutation.isPending,
    isUpdating : updateNewsMutation.isPending,
    isDeleting : deleteNewsMutation.isPending,
  }
}

export const useNewDetail = (newsId : number) => {
  const QUERY_KEY = ['news' , 'getNewsById' , newsId];
  const newsDetailQuery = useCommonQuery(
    QUERY_KEY,
    () => newsService.getNewsById(newsId),
    {enabled : !!newsId && !isNaN(Number(newsId))}
  ); 
  return {
    newsData : newsDetailQuery.data,
    isLoading : newsDetailQuery.isLoading
  }
}