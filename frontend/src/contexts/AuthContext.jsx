// Context = "kho chung" để mọi component biết ai đang đăng nhập mà không phải truyền props qua nhiều tầng.
import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/auth.service';
import { STAFF_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Khởi tạo từ localStorage để F5 trang không bị văng ra
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Lúc mở app: nếu còn token thì gọi /auth/profile để (1) kiểm tra token còn hạn, (2) lấy reader_id
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getProfile()
      .then((profile) => saveUser(profile))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function saveUser(profile) {
    // /login trả `role`, /profile trả `role_name` -> chuẩn hoá thành `role`
    const normalized = { ...profile, role: profile.role || profile.role_name };
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  }

  async function login(username, password) {
    const { token } = await authService.login(username, password);
    localStorage.setItem('token', token);
    const profile = await authService.getProfile(); // có reader_id, class_name...
    saveUser(profile);
    return profile;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isStaff: !!user && STAFF_ROLES.includes(user.role),
    isReader: user?.role === 'READER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook tiện dụng: const { user, login } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
