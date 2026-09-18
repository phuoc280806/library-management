import api from './api';

export async function searchReaders(keyword = '') {
  const { data } = await api.get('/readers', { params: { keyword } });
  return data;
}

export async function getReader(id) {
  const { data } = await api.get(`/readers/${id}`);
  return data;
}

export async function createReader(reader) {
  const { data } = await api.post('/readers', reader);
  return data;
}

export async function updateReader(id, reader) {
  const { data } = await api.put(`/readers/${id}`, reader);
  return data;
}

// Sách bạn đọc đang giữ (chưa trả). Bạn đọc chỉ gọi được với id của mình.
export async function getBorrowingsOfReader(readerId) {
  const { data } = await api.get(`/readers/${readerId}/borrowings`);
  return data;
}
