const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
console.log("process.env", process.env);
console.log("process.env", process.env.NEXT_PUBLIC_API_URL);
const getToken = () => {
  try {
    const raw = localStorage.getItem("pos-auth");
    console.log("RAW -> ", raw);
    if (!raw) return null;
    console.log("TOKEN -> ", JSON.parse(raw)?.state?.token ?? null);
    return JSON.parse(raw)?.state?.token ?? null;
  } catch { return null; }
};

const request = async (method: string, path: string, body?: unknown) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export const api = {
  get:    (path: string)                  => request("GET",    path),
  post:   (path: string, body: unknown)   => request("POST",   path, body),
  patch:  (path: string, body: unknown)   => request("PATCH",  path, body),
  put:    (path: string, body: unknown)   => request("PUT",    path, body),
  delete: (path: string)                  => request("DELETE", path),
};
