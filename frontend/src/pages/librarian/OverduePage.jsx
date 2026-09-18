import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as borrowsService from '../../services/borrows.service';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function OverduePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    borrowsService
      .getOverdue()
      .then(setRows)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Sách quá hạn chưa trả" subtitle={`${rows.length} cuốn`} />
      <Alert message={error} />

      <div className="card shadow-sm">
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState icon="bi-emoji-smile" text="Không có sách nào quá hạn" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Phiếu</th>
                  <th>Bạn đọc</th>
                  <th>Mã bản sao</th>
                  <th>Tên sách</th>
                  <th>Hạn trả</th>
                  <th>Trễ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td><Link to={`/tickets/${r.borrow_id}`}>#{r.borrow_id}</Link></td>
                    <td>
                      <div className="fw-semibold">{r.full_name}</div>
                      <div className="text-secondary small">{r.reader_code}</div>
                    </td>
                    <td><code>{r.copy_code}</code></td>
                    <td>{r.title}</td>
                    <td>{formatDate(r.due_date)}</td>
                    <td><span className="badge text-bg-danger">{r.days_overdue} ngày</span></td>
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
