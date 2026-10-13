const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "";

export const api = async (path, options = {}) => {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
};
