// Khung chung cho mọi trang sau đăng nhập: navbar trên + nội dung dưới.
// Menu thay đổi theo vai trò (bạn đọc / thủ thư / admin).
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

const readerMenu = [
  { to: '/books', icon: 'bi-search', label: 'Tra cứu sách' },
  { to: '/my-borrowings', icon: 'bi-journal-bookmark', label: 'Sách đang mượn' },
  { to: '/fines', icon: 'bi-cash-coin', label: 'Tiền phạt' },
];

const staffMenu = [
  { to: '/books', icon: 'bi-book', label: 'Sách' },
  { to: '/readers', icon: 'bi-people', label: 'Bạn đọc' },
  { to: '/borrow', icon: 'bi-box-arrow-up-right', label: 'Lập phiếu mượn' },
  { to: '/return', icon: 'bi-box-arrow-in-down', label: 'Trả sách' },
  { to: '/tickets', icon: 'bi-receipt', label: 'Tra phiếu' },
  { to: '/overdue', icon: 'bi-exclamation-triangle', label: 'Quá hạn' },
  { to: '/fines', icon: 'bi-cash-coin', label: 'Tiền phạt' },
];

export default function MainLayout() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const menu = isStaff ? staffMenu : readerMenu;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid px-3 px-lg-4">
          <NavLink className="navbar-brand fw-semibold" to="/">
            <i className="bi bi-bookshelf me-2" />
            Thư viện THPT
          </NavLink>

          {/* Nút ☰ trên màn hình nhỏ (cần bootstrap.bundle.js, đã import ở main.jsx) */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto">
              {menu.map((item) => (
                <li className="nav-item" key={item.to}>
                  {/* NavLink tự thêm class "active" khi URL trùng */}
                  <NavLink className="nav-link" to={item.to}>
                    <i className={`bi ${item.icon} me-1`} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle me-1" />
                  {user.full_name}
                  <span className="badge text-bg-light ms-2">{ROLE_LABELS[user.role] || user.role}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <NavLink className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2" />Hồ sơ
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2" />Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container-fluid px-3 px-lg-4 py-4 flex-grow-1">
        <Outlet /> {/* trang hiện tại render vào đây */}
      </main>

      <footer className="text-center text-secondary small py-3 border-top bg-white">
        Đồ án Nhập môn Công nghệ phần mềm — Hệ thống quản lý thư viện THPT
      </footer>
    </div>
  );
}
