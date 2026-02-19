import { useState, useCallback } from "react";

/**
 * Generic hook for calling NeoTrace API endpoints.
 * Returns { data, loading, error, execute }
 *
 * @param {string} endpoint — e.g. "/api/phone/check"
 * @param {string} [method] — "POST" | "GET"
 */
export function useApi(endpoint, method = "POST") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (body, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const fetchOptions = {
          method,
          ...options,
        };

        if (body instanceof FormData) {
          fetchOptions.body = body;
        } else if (body !== undefined) {
          fetchOptions.headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          };
          fetchOptions.body = JSON.stringify(body);
        }

        const res = await fetch(endpoint, fetchOptions);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json);
        return json;
      } catch (err) {
        setError(err.message || "Request failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

export default useApi;
