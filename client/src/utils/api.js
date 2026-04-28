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
    req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => req('/api/auth/logout', { method: 'POST' }),

  me: () => req('/api/auth/me'),

  getMembers: () => req('/api/members'),
  getMember: (id) => req(`/api/members/${encodeURIComponent(id)}`),
  verifyToken: (token) => req(`/api/verify/${encodeURIComponent(token)}`),
  createMember: (data) =>
    req('/api/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) =>
    req(`/api/members/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMember: (id) =>
    req(`/api/members/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getQR: (id) => req(`/api/members/${encodeURIComponent(id)}/qr`),
  getStats: () => req('/api/stats'),
};
