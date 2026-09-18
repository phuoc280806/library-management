// Một form dùng cho cả Thêm (/books/new) lẫn Sửa (/books/:id/edit): có :id thì là sửa.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as booksService from '../../services/books.service';
import { getErrorMessage } from '../../services/api';
import { CATEGORIES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const EMPTY = { isbn: '', title: '', author: '', publisher: '', publish_year: '', category_id: '' };

export default function BookFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Sửa: tải dữ liệu cũ đổ vào form
  useEffect(() => {
    if (!isEdit) return;
    booksService
      .getBook(id)
      .then((b) =>
        setForm({
          isbn: b.isbn || '',
          title: b.title || '',
          author: b.author || '',
          publisher: b.publisher || '',
          publish_year: b.publish_year || '',
          category_id: b.category_id || '',
        })
      )
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...form, publish_year: form.publish_year || null, category_id: Number(form.category_id) };
      const saved = isEdit ? await booksService.updateBook(id, payload) : await booksService.createBook(payload);
      navigate(`/books/${saved.book_id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader title={isEdit ? 'Sửa sách' : 'Thêm sách mới'}>
        <Link to="/books" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />Quay lại
        </Link>
      </PageHeader>

      <div className="card shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body">
          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Tên sách <span className="text-danger">*</span></label>
              <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tác giả</label>
              <input className="form-control" name="author" value={form.author} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Thể loại <span className="text-danger">*</span></label>
              <select className="form-select" name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">-- Chọn thể loại --</option>
                {CATEGORIES.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Nhà xuất bản</label>
              <input className="form-control" name="publisher" value={form.publisher} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Năm xuất bản</label>
              <input type="number" className="form-control" name="publish_year" min="1900" max="2100" value={form.publish_year} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">ISBN</label>
              <input className="form-control" name="isbn" value={form.isbn} onChange={handleChange} />
            </div>

            <div className="col-12 d-flex gap-2 justify-content-end">
              <Link to="/books" className="btn btn-outline-secondary">Huỷ</Link>
              <button className="btn btn-primary" disabled={busy}>
                {busy && <span className="spinner-border spinner-border-sm me-1" />}
                {isEdit ? 'Lưu thay đổi' : 'Thêm sách'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
