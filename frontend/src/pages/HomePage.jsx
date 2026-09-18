// Trang chủ: lối tắt tới các chức năng theo vai trò.
// (Milestone 9 sẽ thêm số liệu thống kê khi backend có API.)
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

const readerCards = [
  { to: '/books', icon: 'bi-search', title: 'Tra cứu sách', text: 'Tìm sách và xem còn bao nhiêu bản có thể mượn', color: 'primary' },
  { to: '/my-borrowings', icon: 'bi-journal-bookmark', title: 'Sách đang mượn', text: 'Xem hạn trả của từng cuốn đang giữ', color: 'success' },
  { to: '/fines', icon: 'bi-cash-coin', title: 'Tiền phạt', text: 'Các khoản phạt do trả sách trễ', color: 'warning' },
];

const staffCards = [
  { to: '/borrow', icon: 'bi-box-arrow-up-right', title: 'Lập phiếu mượn', text: 'Chọn bạn đọc, nhập mã bản sao', color: 'primary' },
  { to: '/return', icon: 'bi-box-arrow-in-down', title: 'Trả sách', text: 'Quét/nhập mã bản sao, tự tính tiền phạt', color: 'success' },
  { to: '/overdue', icon: 'bi-exclamation-triangle', title: 'Sách quá hạn', text: 'Danh sách bạn đọc đang giữ sách quá hạn', color: 'danger' },
  { to: '/books', icon: 'bi-book', title: 'Quản lý sách', text: 'Thêm, sửa, xoá đầu sách', color: 'info' },
  { to: '/readers', icon: 'bi-people', title: 'Quản lý bạn đọc', text: 'Thêm bạn đọc, khoá / mở tài khoản', color: 'secondary' },
  { to: '/fines', icon: 'bi-cash-coin', title: 'Thu tiền phạt', text: 'Khoản phạt chưa nộp và đã nộp', color: 'warning' },
];

export default function HomePage() {
  const { user, isStaff } = useAuth();
  const cards = isStaff ? staffCards : readerCards;

  return (
    <>
      <div className="mb-4">
        <h4 className="mb-1">Xin chào, {user.full_name}</h4>
        <div className="text-secondary">
          Bạn đang đăng nhập với vai trò <strong>{ROLE_LABELS[user.role]}</strong>
          {user.reader_code && <> — mã bạn đọc <code>{user.reader_code}</code></>}
        </div>
      </div>

      <div className="row g-3">
        {cards.map((c) => (
          <div className="col-12 col-md-6 col-xl-4" key={c.to}>
            <Link to={c.to} className="text-decoration-none">
              <div className="card card-stat h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className={`text-${c.color}`}>
                    <i className={`bi ${c.icon}`} />
                  </div>
                  <div>
                    <div className="fw-semibold text-body">{c.title}</div>
                    <div className="text-secondary small">{c.text}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
