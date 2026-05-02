const API_BASE = (import.meta as any).env.VITE_API_URL || "/api";

export interface Video {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  category: string;
  notes?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface VideoStats {
  total: number;
  byCategory: Category[];
}

export interface CreateVideoInput {
  youtubeUrl: string;
  title: string;
  category: string;
  notes?: string;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw err;
  }
  return res.json();
}

export const api = {
  listVideos: (category?: string) =>
    fetchApi<Video[]>(`/videos${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  createVideo: (data: CreateVideoInput) =>
    fetchApi<Video>("/videos", { method: "POST", body: JSON.stringify(data) }),
  getVideo: (id: string) => fetchApi<Video>(`/videos/${id}`),
  deleteVideo: (id: string) =>
    fetchApi<{ success: boolean; message: string }>(`/videos/${id}`, { method: "DELETE" }),
  listCategories: () => fetchApi<Category[]>("/categories"),
  getVideoStats: () => fetchApi<VideoStats>("/videos/stats"),
};
