/**
 * Robust JSON fetcher with timeout and safe error handling.
 */

export interface FetchJsonResult<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Fetches JSON from a URL with an 8-second default timeout and built-in try/catch.
 * Returns { data, error } and never throws uncaught errors.
 *
 * @param url The resource URL to fetch.
 * @param opts Standard RequestInit options, plus an optional timeoutMs override.
 * @returns Promise resolving to { data, error }
 */
export async function fetchJson<T = unknown>(
  url: string,
  opts?: FetchJsonOptions
): Promise<FetchJsonResult<T>> {
  const timeoutMs = opts?.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (opts?.signal) {
      opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    const fetchOpts: RequestInit = { ...opts };
    delete (fetchOpts as FetchJsonOptions).timeoutMs;

    const response = await fetch(url, {
      ...fetchOpts,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errJson = await response.json();
        errorDetail =
          typeof errJson === "object" && errJson !== null
            ? (errJson as { message?: string; error?: string }).message ||
              (errJson as { message?: string; error?: string }).error ||
              JSON.stringify(errJson)
            : String(errJson);
      } catch {
        try {
          errorDetail = await response.text();
        } catch {
          // ignore error reading response body
        }
      }

      return {
        data: null,
        error: `HTTP ${response.status} (${response.statusText || "Error"})${
          errorDetail ? `: ${errorDetail.slice(0, 300)}` : ""
        }`,
      };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return {
          data: null,
          error: `Request timed out after ${timeoutMs}ms`,
        };
      }
      return {
        data: null,
        error: err.message,
      };
    }
    return {
      data: null,
      error: "An unexpected error occurred during fetch",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default fetchJson;
