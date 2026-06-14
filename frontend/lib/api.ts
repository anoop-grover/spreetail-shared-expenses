const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = RequestInit & {
  token?: string;
};

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refresh = localStorage.getItem("refreshToken");

  if (!refresh) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refresh
      })
    });

    if (!response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }

    const data = await response.json();

    localStorage.setItem("accessToken", data.access);

    return data.access;
  } catch {
    return null;
  }
}

export async function api<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token =
    options.token ??
    (typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      headers.set("Authorization", `Bearer ${newAccessToken}`);

      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        cache: "no-store"
      });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }

      throw new Error("Session expired");
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const demoToken = () =>
  typeof window === "undefined"
    ? ""
    : localStorage.getItem("accessToken") ?? "";