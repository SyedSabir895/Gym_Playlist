export const API_BASE = (import.meta as any).env.VITE_API_URL || "/api";

export interface Video {
  id: string;
  youtubeUrl?: string;
  youtubeId?: string;
  googleFileId?: string;
  localPath?: string;
  videoUrl: string;
  isLocal: boolean;
  title: string;
  category: string;
  notes?: string;
  thumbnailUrl?: string;
  createdAt: string;
  userId: string;
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
  youtubeUrl?: string;
  videoFile?: File;
  title: string;
  category: string;
  notes?: string;
}

function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  
  // Don't set Content-Type if body is FormData, fetch will set it with boundary
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const googleToken = localStorage.getItem("googleToken");
  if (googleToken) {
    headers["x-google-token"] = googleToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers as any,
    },
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
  createVideo: (data: CreateVideoInput) => {
    if (data.videoFile) {
      const formData = new FormData();
      formData.append("videoFile", data.videoFile);
      formData.append("title", data.title);
      formData.append("category", data.category);
      if (data.notes) formData.append("notes", data.notes);
      return fetchApi<Video>("/videos", { method: "POST", body: formData });
    }
    return fetchApi<Video>("/videos", { method: "POST", body: JSON.stringify(data) });
  },
  getVideo: (id: string) => fetchApi<Video>(`/videos/${id}`),
  deleteVideo: (id: string) =>
    fetchApi<{ success: boolean; message: string }>(`/videos/${id}`, { method: "DELETE" }),
  listCategories: () => fetchApi<Category[]>("/categories"),
  getVideoStats: () => fetchApi<VideoStats>("/videos/stats"),
};
