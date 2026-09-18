import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../services/api';
import Alert from '../../components/Alert';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Đã đăng nhập rồi mà vào /login -> đưa về trang chủ
  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // không cho trình duyệt reload trang
    setError('');
    setBusy(true);
    try {
      await login(form.username, form.password);
      // Quay lại trang người dùng định vào trước khi bị chặn (xem ProtectedRoute), mặc định trang chủ
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-bookshelf text-primary" style={{ fontSize: '3rem' }} />
            <h4 className="mt-2 mb-0">Thư viện THPT</h4>
            <div className="text-secondary small">Đăng nhập để tiếp tục</div>
          </div>

          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tên đăng nhập</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" />}
              Đăng nhập
            </button>
          </form>

          <div className="text-secondary small mt-4">
            <div className="fw-semibold mb-1">Tài khoản mẫu (mật khẩu <code>123456</code>):</div>
            <ul className="mb-0 ps-3">
              <li><code>admin</code> — quản trị viên</li>
              <li><code>thuthu01</code> — thủ thư</li>
              <li><code>hs10a1_001</code> — học sinh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
