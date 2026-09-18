import api from './api';

// filter: { status: 'UNPAID' | 'PAID', reader_id }
export async function getFines(filter = {}) {
  const { data } = await api.get('/fines', { params: filter });
  return data;
}

export async function payFine(id) {
  const { data } = await api.put(`/fines/${id}/pay`);
  return data;
}
