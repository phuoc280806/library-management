// Backend chưa có API /categories nên tạm khai báo cứng theo database/seed.sql.
// Khi nào có API thì thay bằng gọi service.
export const CATEGORIES = [
  { category_id: 1, category_name: 'Sách giáo khoa' },
  { category_id: 2, category_name: 'Văn học' },
  { category_id: 3, category_name: 'Khoa học' },
  { category_id: 4, category_name: 'Tham khảo' },
];

export function categoryName(id) {
  return CATEGORIES.find((c) => c.category_id === Number(id))?.category_name || `#${id}`;
}

export const READER_TYPES = [
  { value: 'STUDENT', label: 'Học sinh' },
  { value: 'TEACHER', label: 'Giáo viên' },
];

export const ROLE_LABELS = {
  READER: 'Bạn đọc',
  LIBRARIAN: 'Thủ thư',
  ADMIN: 'Quản trị viên',
};

// Nhãn tiếng Việt + màu Bootstrap cho từng trạng thái trong DB
export const STATUS = {
  // borrow_tickets.status
  BORROWING: { label: 'Đang mượn', color: 'primary' },
  COMPLETED: { label: 'Đã trả xong', color: 'success' },
  OVERDUE: { label: 'Quá hạn', color: 'danger' },
  // borrow_details.status
  BORROWED: { label: 'Đang mượn', color: 'primary' },
  RETURNED: { label: 'Đã trả', color: 'success' },
  // fines.status
  UNPAID: { label: 'Chưa nộp', color: 'warning' },
  PAID: { label: 'Đã nộp', color: 'success' },
  // book_copies.status
  AVAILABLE: { label: 'Sẵn sàng', color: 'success' },
  LOST: { label: 'Mất', color: 'dark' },
  DAMAGED: { label: 'Hỏng', color: 'secondary' },
};

export const STAFF_ROLES = ['LIBRARIAN', 'ADMIN'];
