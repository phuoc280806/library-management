// Tra cứu sách. Bạn đọc chỉ xem; thủ thư/admin có thêm nút Thêm / Sửa / Xoá.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as booksService from '../../services/books.service';
import { getErrorMessage } from '../../services/api';
import { categoryName } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';

export default function BooksPage() {
  const { isStaff } = useAuth();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(null); // sách đang chờ xác nhận xoá
  const [busy, setBusy] = useState(false);

  async function load(kw = keyword) {
    setLoading(true);
    setError('');
    try {
      setBooks(await booksService.searchBooks(kw));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Lần đầu vào trang: tải toàn bộ sách
  useEffect(() => {
    load('');
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await booksService.deleteBook(deleting.book_id);
      setSuccess(`Đã xoá sách "${deleting.title}"`);
      setDeleting(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={isStaff ? 'Quản lý sách' : 'Tra cứu sách'} subtitle={`${books.length} đầu sách`}>
        {isStaff && (
          <Link to="/books/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1" />Thêm sách
          </Link>
        )}
      </PageHeader>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Tìm theo tên sách..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="btn btn-outline-primary">
              <i className="bi bi-search" />
            </button>
          </div>
        </div>
      </form>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card shadow-sm">
        {loading ? (
          <Loading />
        ) : books.length === 0 ? (
          <EmptyState icon="bi-book" text="Không tìm thấy sách nào" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th className="d-none d-md-table-cell">Nhà xuất bản</th>
                  <th className="d-none d-md-table-cell">Năm</th>
                  <th className="d-none d-lg-table-cell">Thể loại</th>
                  <th className="text-center">Còn</th>
                  {isStaff && <th className="text-end">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.book_id} className="clickable" onClick={() => navigate(`/books/${b.book_id}`)}>
                    <td className="fw-semibold">{b.title}</td>
                    <td>{b.author || '—'}</td>
                    <td className="d-none d-md-table-cell">{b.publisher || '—'}</td>
                    <td className="d-none d-md-table-cell">{b.publish_year || '—'}</td>
                    <td className="d-none d-lg-table-cell">{categoryName(b.category_id)}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill text-bg-${b.available > 0 ? 'success' : 'secondary'}`}>
                        {b.available > 0 ? `${b.available} cuốn` : 'Hết'}
                      </span>
                    </td>
                    {isStaff && (
                      // stopPropagation: bấm nút không kích hoạt onClick của cả dòng
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/books/${b.book_id}/edit`} className="btn btn-sm btn-outline-secondary me-1" title="Sửa">
                          <i className="bi bi-pencil" />
                        </Link>
                        <button className="btn btn-sm btn-outline-danger" title="Xoá" onClick={() => setDeleting(b)}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!deleting}
        title="Xoá sách"
        confirmText="Xoá"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      >
        Bạn có chắc muốn xoá <strong>{deleting?.title}</strong> và toàn bộ bản sao của nó?
        <div className="text-secondary small mt-2">Sách đang được mượn hoặc đã có lịch sử mượn sẽ không xoá được.</div>
      </ConfirmModal>
    </>
  );
}
