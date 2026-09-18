import api from './api';

export async function searchBooks(keyword = '') {
  const { data } = await api.get('/books', { params: { keyword } });
  return data;
}

export async function getBook(id) {
  const { data } = await api.get(`/books/${id}`);
  return data;
}

export async function createBook(book) {
  const { data } = await api.post('/books', book);
  return data;
}

export async function updateBook(id, book) {
  const { data } = await api.put(`/books/${id}`, book);
  return data;
}

export async function deleteBook(id) {
  await api.delete(`/books/${id}`); // 204, không có body
}
