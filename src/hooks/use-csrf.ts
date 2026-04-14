"use client";

import { useCallback, useEffect, useRef, useState } from "react";

let cachedToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const res = await fetch("/api/csrf-token");
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const data = await res.json();
  cachedToken = data.csrfToken;
  return cachedToken;
}

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(cachedToken);

  useEffect(() => {
    fetchCsrfToken().then(setToken).catch(() => undefined);
  }, []);

  const refresh = useCallback(async () => {
    const fresh = await fetchCsrfToken();
    setToken(fresh);
    return fresh;
  }, []);

  return { token, refresh };
}

export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = cachedToken || await fetchCsrfToken();

  const headers = new Headers(options.headers || {});
  headers.set("x-csrf-token", csrfToken);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // If 403, token might be stale - try refreshing once
  if (response.status === 403) {
    cachedToken = null;
    const fresh = await fetchCsrfToken();
    headers.set("x-csrf-token", fresh);

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  }

  return response;
}
