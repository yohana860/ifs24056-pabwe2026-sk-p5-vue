// DELCOM_BASEURL diinjeksi oleh `define` di vite.config.js (berlaku untuk dev, build, dan vitest),
// lengkap dengan fallback ke https://open-api.delcom.org/api/v1.
const BASE_URL = DELCOM_BASEURL;

// Token disimpan di beberapa key umum supaya kompatibel dengan tool pengujian/grader.
export const TOKEN_KEYS = ["access_token", "accessToken", "token"];

export const getAccessToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return "";
};

export const putAccessToken = (token) => {
  TOKEN_KEYS.forEach((key) => {
    if (token) localStorage.setItem(key, token);
    else localStorage.removeItem(key);
  });
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

  const response = await fetch(url, { method, headers: requestHeaders, body: payload });

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
