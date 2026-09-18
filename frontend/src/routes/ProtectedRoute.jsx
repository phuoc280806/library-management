// Bọc các trang cần đăng nhập. `roles` (tuỳ chọn) giới hạn thêm theo vai trò,
// giống middleware auth + role() ở backend nhưng ở phía giao diện.
// Lưu ý: đây chỉ là tiện lợi cho người dùng; bảo mật thật sự vẫn nằm ở backend.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  // Chưa đăng nhập -> về /login, nhớ trang định vào để quay lại sau
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Đăng nhập rồi nhưng sai vai trò -> về trang chủ
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />; // render trang con
}
