const BASE_URL = typeof DELCOM_BASEURL !== "undefined"
  ? DELCOM_BASEURL
  : (import.meta.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1");

export const getAccessToken = () => localStorage.getItem("access_token") || "";

export const putAccessToken = (token) => {
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
};

export async function apiFetch(path, { method = "GET", body, query, headers = {} } = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const requestHeaders = { Accept: "application/json", ...headers };
  const token = getAccessToken();
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body instanceof URLSearchParams) {
    requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body && !(body instanceof FormData) && typeof body === "object") {
    requestHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: payload,
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request gagal (${response.status})`);
  }

  return data;
}
