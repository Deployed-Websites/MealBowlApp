// Single source of truth for talking to the Django backend.
// Replaces the duplicated fetch/CSRF logic that used to live separately in
// auth.js, LoginLogic.jsx, SpecificBowlContents.jsx, MainCheckout.jsx,
// HomePage.jsx, Admin.jsx and the unused communicatingWithBackend.js.

const BASE_URL = "https://mealbowlapp.onrender.com/databaseTesting";

// ---- low-level helpers -----------------------------------------------

// Reads whatever the response actually sent back instead of assuming JSON.
// (Every duplicated copy of this logic did the same content-type sniff -
// kept identical here so behavior doesn't change, just the location.)
async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      return await response.text();
    }
  }
  return await response.text();
}

// Asks Django to set the csrftoken cookie, then waits briefly for it to
// actually land (cookies aren't always synchronously readable right after
// the response comes back).
async function requestCsrfCookie() {
  await fetch(`${BASE_URL}/setToken/`, {
    method: "GET",
    credentials: "include",
  });
  return new Promise((resolve) => setTimeout(resolve, 100));
}

// Reads the current csrftoken by asking the backend for it directly
// (this app doesn't read document.cookie itself - Django hands the value
// back in the getToken/ response body).
async function readCsrfToken() {
  const response = await fetch(`${BASE_URL}/getToken/`, {
    method: "GET",
    credentials: "include",
  });
  const body = await parseResponseBody(response);
  return typeof body === "object" ? body.csrftoken : undefined;
}

// Public: guarantees you get a real CSRF token back, setting the cookie
// first if needed, retrying briefly since the cookie can take a moment.
export async function ensureCSRFToken() {
  let token = await readCsrfToken();
  if (!token) {
    await requestCsrfCookie();
    for (let i = 0; i < 10; i++) {
      token = await readCsrfToken();
      if (token) break;
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return token;
}

// ---- generic request wrappers -----------------------------------------

// GET requests that just need the session cookie (no CSRF token needed -
// Django's CSRF protection only applies to unsafe methods like POST).
async function apiGet(path) {
  const response = await fetch(`${BASE_URL}/${path}`, {
    credentials: "include",
  });
  const body = await parseResponseBody(response);
  if (!response.ok) {
    console.log("Server threw an error", body);
  }
  return body;
}

// POST requests: fetches a CSRF token first, sends it in the header,
// always includes credentials so Django's session cookie goes along.
async function apiPost(path, data = {}) {
  const csrfToken = await ensureCSRFToken();
  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const body = await parseResponseBody(response);
    if (response.ok) {
      console.log("Server responded with: ", body);
    } else {
      console.log("Server threw an error", body);
    }
    return body;
  } catch (error) {
    console.log("Error: ", error);
    // Returning an object (not undefined) means callers can safely do
    // `if (result.message)` without crashing - this is the fix for the
    // "Signup button stuck on Please wait forever" bug.
    return { error: true, message: null };
  }
}

// ---- one named function per backend endpoint --------------------------
// Components should only ever call these - never fetch() directly.

export const createUser = (data) => apiPost("createUser/", data);
export const login = (data) => apiPost("login/", data);
export const logout = () => apiGet("logout/");
export const checkUserPerm = () => apiGet("checkUserperm/");

export const updateOrder = (data) => apiPost("updateOrder/", data);
export const deleteOrder = (data) => apiPost("deleteOrder/", data);
export const updateBasket = (data) => apiPost("updateBasket/", data);
export const updateBasketForDeletedOrder = (data) =>
  apiPost("updateBasketForDeletedOrder/", data);

export const getEverything = () => apiGet("getEverything/");
export const getPrices = () => apiGet("getPrices/");
export const getEverythingForThatUser = () =>
  apiGet("getEverythingForThatUser/");
