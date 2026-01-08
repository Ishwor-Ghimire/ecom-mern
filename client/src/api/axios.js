const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api";

const buildHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (path, { method = "GET", body } = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");
    error.response = { data };
    throw error;
  }

  return { data };
};

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;
