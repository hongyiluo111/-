export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super(data.error as string || `请求失败 (${status})`);
    this.status = status;
    this.data = data;
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...options });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new ApiError(res.status, data);
  }

  return res.json();
}
