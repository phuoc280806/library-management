import api from './api';

// Lập phiếu mượn: { reader_id, copy_codes: ['NV10-001', ...] }
export async function createBorrow(readerId, copyCodes) {
  const { data } = await api.post('/borrows', { reader_id: readerId, copy_codes: copyCodes });
  return data;
}

// Trả 1 bản sao theo mã -> { borrow_id, copy_code, late_days, fine_amount }
export async function returnCopy(copyCode) {
  const { data } = await api.post('/borrows/return', { copy_code: copyCode });
  return data;
}

export async function getTicket(id) {
  const { data } = await api.get(`/borrows/${id}`);
  return data;
}

export async function getOverdue() {
  const { data } = await api.get('/borrows/overdue');
  return data;
}
