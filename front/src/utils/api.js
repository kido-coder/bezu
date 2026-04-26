const BASE = process.env.REACT_APP_API_URL;

/**
 * Wrapper around fetch that:
 *  - Always sends the httpOnly JWT cookie (credentials: 'include')
 *  - Defaults to POST + JSON Content-Type
 *  - Redirects to login on 401 / 403 so every caller gets this for free
 *
 * Usage:
 *   const res = await apiPost('/mid', { action: 'fetch_node', user });
 *   if (!res) return;              // 401 guard (redirect already triggered)
 *   const data = await res.json();
 */
export async function apiPost(endpoint, body) {
  let res;
  try {
    res = await fetch(`${BASE}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error(`apiPost ${endpoint} network error:`, networkErr);
    return null;
  }

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('type');
    localStorage.removeItem('userDisplayName');
    window.location.href = '/';
    return null;
  }

  return res;
}

/** Convenience: POST and parse JSON in one step. Returns null on auth/network error. */
export async function apiPostJSON(endpoint, body) {
  const res = await apiPost(endpoint, body);
  if (!res) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Current logged-in user ID (employee code) stored by Login.js */
export const getCurrentUser = () => localStorage.getItem('userDisplayName') ?? '';

/** Current role as a number: 1 = Engineer, 2 = Dispatcher, 3 = Admin */
export const getCurrentRole = () => Number(localStorage.getItem('type') ?? 0);
