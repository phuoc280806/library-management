// Backend trả ngày dạng chuỗi 'YYYY-MM-DD' hoặc 'YYYY-MM-DD HH:mm:ss' (dateStrings: true)
// -> hiển thị kiểu Việt Nam dd/mm/yyyy
export function formatDate(value) {
  if (!value) return '—';
  const [datePart] = String(value).split(' ');
  const [y, m, d] = datePart.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const [datePart, timePart] = String(value).split(' ');
  return timePart ? `${formatDate(datePart)} ${timePart.slice(0, 5)}` : formatDate(datePart);
}

// DECIMAL trong MySQL về dạng chuỗi '2000.00' -> '2.000 đ'
export function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}
