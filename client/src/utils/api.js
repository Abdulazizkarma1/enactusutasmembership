const BASE = process.env.REACT_APP_API_URL || '';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => req('/auth/logout', { method: 'POST' }),

  me: () => req('/auth/me'),

  getMembers: () => req('/members'),
  getMember: (id) => req(`/members/${encodeURIComponent(id)}`),
  verifyToken: (token) => req(`/verify/${encodeURIComponent(token)}`),
  createMember: (data) =>
    req('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) =>
    req(`/members/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMember: (id) =>
    req(`/members/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getQR: (id) => req(`/members/${encodeURIComponent(id)}/qr`),
  getStats: () => req('/stats'),
};
