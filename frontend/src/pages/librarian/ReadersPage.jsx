import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as readersService from '../../services/readers.service';
import { getErrorMessage } from '../../services/api';
import { READER_TYPES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function ReadersPage() {
  const [keyword, setKeyword] = useState('');
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(kw = keyword) {
    setLoading(true);
    setError('');
    try {
      setReaders(await readersService.searchReaders(kw));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load('');
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  const typeLabel = (v) => READER_TYPES.find((t) => t.value === v)?.label || v;

  return (
    <>
      <PageHeader title="Quản lý bạn đọc" subtitle={`${readers.length} bạn đọc`}>
        <Link to="/readers/new" className="btn btn-primary">
          <i className="bi bi-person-plus me-1" />Thêm bạn đọc
        </Link>
      </PageHeader>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Tìm theo tên hoặc mã bạn đọc..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="btn btn-outline-primary"><i className="bi bi-search" /></button>
          </div>
        </div>
      </form>

      <Alert message={error} onClose={() => setError('')} />

      <div className="card shadow-sm">
        {loading ? (
          <Loading />
        ) : readers.length === 0 ? (
          <EmptyState icon="bi-people" text="Không tìm thấy bạn đọc nào" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã</th>
                  <th>Họ tên</th>
                  <th className="d-none d-md-table-cell">Loại</th>
                  <th className="d-none d-md-table-cell">Lớp</th>
                  <th className="d-none d-lg-table-cell">Tên đăng nhập</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {readers.map((r) => (
                  <tr key={r.reader_id}>
                    <td><code>{r.reader_code}</code></td>
                    <td className="fw-semibold">{r.full_name}</td>
                    <td className="d-none d-md-table-cell">{typeLabel(r.reader_type)}</td>
                    <td className="d-none d-md-table-cell">{r.class_name || '—'}</td>
                    <td className="d-none d-lg-table-cell">{r.username}</td>
                    <td>
                      {/* users.status: 1 = hoạt động, 0 = bị khoá */}
                      {r.status ? (
                        <span className="badge text-bg-success">Hoạt động</span>
                      ) : (
                        <span className="badge text-bg-danger"><i className="bi bi-lock me-1" />Bị khoá</span>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <Link to={`/readers/${r.reader_id}/borrowings`} className="btn btn-sm btn-outline-primary me-1" title="Sách đang mượn">
                        <i className="bi bi-journal-bookmark" />
                      </Link>
                      <Link to={`/readers/${r.reader_id}/edit`} className="btn btn-sm btn-outline-secondary" title="Sửa">
                        <i className="bi bi-pencil" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
