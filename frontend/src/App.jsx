// Bản đồ URL -> trang. Lồng nhau: ProtectedRoute (kiểm tra đăng nhập/role) -> MainLayout (navbar) -> trang.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/books/BookDetailPage';
import BookFormPage from './pages/librarian/BookFormPage';

import ReadersPage from './pages/librarian/ReadersPage';
import ReaderFormPage from './pages/librarian/ReaderFormPage';
import BorrowingsPage from './pages/BorrowingsPage';

import BorrowPage from './pages/librarian/BorrowPage';
import ReturnPage from './pages/librarian/ReturnPage';
import TicketPage from './pages/librarian/TicketPage';
import OverduePage from './pages/librarian/OverduePage';
import FinesPage from './pages/FinesPage';

const STAFF = ['LIBRARIAN', 'ADMIN'];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Mọi người đã đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/my-borrowings" element={<BorrowingsPage />} />
              <Route path="/fines" element={<FinesPage />} />
              <Route path="/tickets/:id" element={<TicketPage />} />
            </Route>
          </Route>

          {/* Chỉ thủ thư / admin */}
          <Route element={<ProtectedRoute roles={STAFF} />}>
            <Route element={<MainLayout />}>
              <Route path="/books/new" element={<BookFormPage />} />
              <Route path="/books/:id/edit" element={<BookFormPage />} />
              <Route path="/readers" element={<ReadersPage />} />
              <Route path="/readers/new" element={<ReaderFormPage />} />
              <Route path="/readers/:id/edit" element={<ReaderFormPage />} />
              <Route path="/readers/:id/borrowings" element={<BorrowingsPage />} />
              <Route path="/borrow" element={<BorrowPage />} />
              <Route path="/return" element={<ReturnPage />} />
              <Route path="/tickets" element={<TicketPage />} />
              <Route path="/overdue" element={<OverduePage />} />
            </Route>
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
