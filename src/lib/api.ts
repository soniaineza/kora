export function getApiBase() {
  const apiBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;

  const resolved = apiBase || window.location.origin;
  // Normalize: avoid double slashes when concatenating `${apiBase}${path}`.
  return resolved.replace(/\/$/, '');
}




export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {

  const apiBase = getApiBase();
  const token = localStorage.getItem('kora-jwt');

  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

