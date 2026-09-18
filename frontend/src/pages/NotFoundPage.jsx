import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center bg-light">
      <h1 className="display-4">404</h1>
      <p className="text-secondary">Không tìm thấy trang bạn yêu cầu.</p>
      <Link to="/" className="btn btn-primary">Về trang chủ</Link>
    </div>
  );
}
