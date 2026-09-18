// Một instance axios dùng chung cho toàn app.
// Vì sao: mọi request đều cần cùng baseURL + cùng cách gắn token + cùng cách xử lý 401,
// viết một chỗ ở đây thay vì lặp lại trong từng trang.
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Trước khi gửi: nếu đã đăng nhập thì gắn "Authorization: Bearer <token>"
// (backend middlewares/auth.js đọc header này để biết ai đang gọi)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sau khi nhận: token hết hạn / sai -> backend trả 401 -> xoá token, quay về trang đăng nhập
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Rút message lỗi backend gửi ({ message }) để hiện lên giao diện
export function getErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Có lỗi xảy ra';
}

export default api;
