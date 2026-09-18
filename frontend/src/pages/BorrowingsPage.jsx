// Sách đang mượn của một bạn đọc.
// - Bạn đọc vào /my-borrowings: lấy reader_id từ tài khoản của mình.
// - Thủ thư vào /readers/:id/borrowings: lấy id từ URL.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as readersService from '../services/readers.service';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function BorrowingsPage() {
  const { id } = useParams();
  const { user, isStaff } = useAuth();
  const readerId = id || user.reader_id;

  const [reader, setReader] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!readerId) {
      setError('Tài khoản này không phải bạn đọc');
      setLoading(false);
      return;
    }
    const jobs = [readersService.getBorrowingsOfReader(readerId)];
    if (isStaff) jobs.push(readersService.getReader(readerId)); // lấy tên để hiện tiêu đề
    Promise.all(jobs)
      .then(([borrowings, info]) => {
        setRows(borrowings);
        setReader(info || null);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [readerId, isStaff]);

  const overdueCount = rows.filter((r) => r.days_overdue > 0).length;
  const title = isStaff && reader ? `Sách đang mượn — ${reader.full_name}` : 'Sách tôi đang mượn';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${rows.length} cuốn đang giữ${overdueCount ? `, ${overdueCount} cuốn quá hạn` : ''}`}
      >
        {isStaff && (
          <Link to="/readers" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" />Quay lại
          </Link>
        )}
      </PageHeader>

      <Alert message={error} />

      <div className="card shadow-sm">
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState icon="bi-journal-check" text="Không có sách nào đang mượn" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Phiếu</th>
                  <th>Mã bản sao</th>
                  <th>Tên sách</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.borrow_detail_id} className={r.days_overdue > 0 ? 'table-danger' : ''}>
                    <td><Link to={`/tickets/${r.borrow_id}`}>#{r.borrow_id}</Link></td>
                    <td><code>{r.copy_code}</code></td>
                    <td className="fw-semibold">{r.title}</td>
                    <td>{formatDate(r.borrow_date)}</td>
                    <td>{formatDate(r.due_date)}</td>
                    <td>
                      {r.days_overdue > 0 ? (
                        <span className="badge text-bg-danger">Quá hạn {r.days_overdue} ngày</span>
                      ) : (
                        <span className="badge text-bg-success">Còn hạn</span>
                      )}
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
