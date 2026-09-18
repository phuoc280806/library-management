// Tiền phạt. Bạn đọc: backend tự lọc theo tài khoản. Thủ thư: xem tất cả + nút "Thu tiền".
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as finesService from '../services/fines.service';
import { getErrorMessage } from '../services/api';
import { formatDateTime, formatMoney } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

const FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'UNPAID', label: 'Chưa nộp' },
  { value: 'PAID', label: 'Đã nộp' },
];

export default function FinesPage() {
  const { isStaff } = useAuth();
  // Trạng thái lọc nằm trên URL (?status=UNPAID) để có thể link thẳng từ trang Trả sách
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paying, setPaying] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await finesService.getFines(status ? { status } : {}));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]); // đổi bộ lọc -> tải lại

  async function handlePay() {
    setBusy(true);
    try {
      await finesService.payFine(paying.fine_id);
      setSuccess(`Đã thu ${formatMoney(paying.amount)} của ${paying.full_name}`);
      setPaying(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setPaying(null);
    } finally {
      setBusy(false);
    }
  }

  const unpaidTotal = rows.filter((r) => r.status === 'UNPAID').reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      <PageHeader
        title={isStaff ? 'Tiền phạt' : 'Tiền phạt của tôi'}
        subtitle={unpaidTotal > 0 ? `Chưa nộp: ${formatMoney(unpaidTotal)}` : 'Không còn khoản nào chưa nộp'}
      />

      {/* Nhóm nút lọc kiểu tab */}
      <div className="btn-group mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${status === f.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSearchParams(f.value ? { status: f.value } : {})}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card shadow-sm">
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState icon="bi-cash-coin" text="Không có khoản phạt nào" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {isStaff && <th>Bạn đọc</th>}
                  <th>Sách</th>
                  <th>Phiếu</th>
                  <th>Lý do</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th className="d-none d-md-table-cell">Ngày nộp</th>
                  {isStaff && <th className="text-end">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => (
                  <tr key={f.fine_id}>
                    {isStaff && (
                      <td>
                        <div className="fw-semibold">{f.full_name}</div>
                        <div className="text-secondary small">{f.reader_code}</div>
                      </td>
                    )}
                    <td>
                      {f.title}
                      <div className="text-secondary small"><code>{f.copy_code}</code></div>
                    </td>
                    <td><Link to={`/tickets/${f.borrow_id}`}>#{f.borrow_id}</Link></td>
                    <td>{f.reason}</td>
                    <td className="fw-semibold">{formatMoney(f.amount)}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td className="d-none d-md-table-cell">{formatDateTime(f.paid_at)}</td>
                    {isStaff && (
                      <td className="text-end">
                        {f.status === 'UNPAID' && (
                          <button className="btn btn-sm btn-success" onClick={() => setPaying(f)}>
                            <i className="bi bi-cash me-1" />Thu tiền
                          </button>
                        )}
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
        show={!!paying}
        title="Xác nhận thu tiền phạt"
        confirmText="Đã thu"
        confirmColor="success"
        busy={busy}
        onConfirm={handlePay}
        onCancel={() => setPaying(null)}
      >
        Thu <strong>{formatMoney(paying?.amount)}</strong> của <strong>{paying?.full_name}</strong> ({paying?.reason})?
      </ConfirmModal>
    </>
  );
}
