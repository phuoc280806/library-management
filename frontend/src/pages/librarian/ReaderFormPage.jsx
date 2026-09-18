// Thêm: tạo cả tài khoản (users) lẫn hồ sơ bạn đọc (readers) trong 1 lần.
// Sửa: không đổi username / mã bạn đọc (định danh), nhưng có thể khoá / mở tài khoản.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as readersService from '../../services/readers.service';
import { getErrorMessage } from '../../services/api';
import { READER_TYPES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const EMPTY = {
  username: '',
  password: '',
  full_name: '',
  email: '',
  phone: '',
  reader_code: '',
  reader_type: 'STUDENT',
  class_name: '',
  date_of_birth: '',
  status: 1,
};

export default function ReaderFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    readersService
      .getReader(id)
      .then((r) =>
        setForm({
          ...EMPTY,
          ...r,
          email: r.email || '',
          phone: r.phone || '',
          class_name: r.class_name || '',
          date_of_birth: r.date_of_birth || '',
        })
      )
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) {
        await readersService.updateReader(id, form);
      } else {
        await readersService.createReader(form);
      }
      navigate('/readers');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader title={isEdit ? `Sửa bạn đọc ${form.reader_code}` : 'Thêm bạn đọc'}>
        <Link to="/readers" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />Quay lại
        </Link>
      </PageHeader>

      <div className="card shadow-sm" style={{ maxWidth: 760 }}>
        <div className="card-body">
          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12"><h6 className="text-secondary mb-0">Tài khoản</h6></div>
            <div className="col-md-6">
              <label className="form-label">Tên đăng nhập <span className="text-danger">*</span></label>
              <input className="form-control" name="username" value={form.username} onChange={handleChange} required disabled={isEdit} />
            </div>
            {!isEdit && (
              <div className="col-md-6">
                <label className="form-label">Mật khẩu</label>
                <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} placeholder="Bỏ trống = dùng mã bạn đọc" />
              </div>
            )}
            {isEdit && (
              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="status" name="status" checked={!!form.status} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="status">
                    {form.status ? 'Tài khoản đang hoạt động' : 'Tài khoản bị khoá'}
                  </label>
                </div>
              </div>
            )}

            <div className="col-12 mt-4"><h6 className="text-secondary mb-0">Thông tin cá nhân</h6></div>
            <div className="col-md-6">
              <label className="form-label">Họ tên <span className="text-danger">*</span></label>
              <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ngày sinh</label>
              <input type="date" className="form-control" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Điện thoại</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="col-12 mt-4"><h6 className="text-secondary mb-0">Hồ sơ bạn đọc</h6></div>
            <div className="col-md-4">
              <label className="form-label">Mã bạn đọc <span className="text-danger">*</span></label>
              <input className="form-control" name="reader_code" value={form.reader_code} onChange={handleChange} required disabled={isEdit} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Loại <span className="text-danger">*</span></label>
              <select className="form-select" name="reader_type" value={form.reader_type} onChange={handleChange}>
                {READER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Lớp</label>
              <input className="form-control" name="class_name" value={form.class_name} onChange={handleChange} placeholder="VD: 10A1" />
            </div>

            <div className="col-12 d-flex gap-2 justify-content-end">
              <Link to="/readers" className="btn btn-outline-secondary">Huỷ</Link>
              <button className="btn btn-primary" disabled={busy}>
                {busy && <span className="spinner-border spinner-border-sm me-1" />}
                {isEdit ? 'Lưu thay đổi' : 'Thêm bạn đọc'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
