import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateVideoInput } from "@/lib/api";

export const videoKeys = {
  all: ["videos"] as const,
  list: (category?: string) => ["videos", "list", category ?? "all"] as const,
  detail: (id: string) => ["videos", "detail", id] as const,
  stats: () => ["videos", "stats"] as const,
  categories: () => ["categories"] as const,
};

export function useListVideos(category?: string) {
  return useQuery({
    queryKey: videoKeys.list(category),
    queryFn: () => api.listVideos(category),
  });
}

export function useGetVideo(id: string) {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: () => api.getVideo(id),
    enabled: !!id,
  });
}

export function useGetVideoStats() {
  return useQuery({
    queryKey: videoKeys.stats(),
    queryFn: api.getVideoStats,
  });
}

export function useListCategories() {
  return useQuery({
    queryKey: videoKeys.categories(),
    queryFn: api.listCategories,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVideoInput) => api.createVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: videoKeys.stats() });
      queryClient.invalidateQueries({ queryKey: videoKeys.categories() });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: videoKeys.stats() });
      queryClient.invalidateQueries({ queryKey: videoKeys.categories() });
    },
  });
}
