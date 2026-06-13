const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = RequestInit & { token?: string };

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const demoToken = () => (typeof window === "undefined" ? "" : localStorage.getItem("accessToken") ?? "");
