import api from './api';

// POST /api/auth/login -> { token, user }
export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
}

// GET /api/auth/profile -> thông tin đầy đủ (có reader_id nếu là bạn đọc)
export async function getProfile() {
  const { data } = await api.get('/auth/profile');
  return data;
}
