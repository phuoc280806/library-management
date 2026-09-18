// Trả sách: nhập mã bản sao -> backend ghi nhận trả + tính phạt nếu trễ.
// Kết quả các lần trả trong phiên hiện dồn xuống dưới để thủ thư đối chiếu.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as borrowsService from '../../services/borrows.service';
import { getErrorMessage } from '../../services/api';
import { formatMoney } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';

export default function ReturnPage() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const copyCode = code.trim().toUpperCase();
    if (!copyCode) return;
    setBusy(true);
    setError('');
    try {
      const result = await borrowsService.returnCopy(copyCode);
      setResults([result, ...results]); // mới nhất lên đầu
      setCode('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Trả sách" />

      <div className="card shadow-sm mb-3" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <label className="form-label">Mã bản sao</label>
            <div className="input-group input-group-lg">
              <input
                className="form-control"
                placeholder="VD: NV10-002"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary" disabled={busy || !code.trim()}>
                {busy ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-box-arrow-in-down me-1" />Nhận trả</>}
              </button>
            </div>
            <div className="form-text">Nhập mã rồi nhấn Enter. Tiền phạt (nếu trễ) được tính tự động theo quy định hiện hành.</div>
          </form>
          <Alert message={error} onClose={() => setError('')} />
        </div>
      </div>

      {results.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-semibold">Đã nhận trả trong phiên này</div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã bản sao</th>
                  <th>Phiếu</th>
                  <th>Trễ</th>
                  <th>Tiền phạt</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={r.late_days > 0 ? 'table-warning' : 'table-success'}>
                    <td><code>{r.copy_code}</code></td>
                    <td><Link to={`/tickets/${r.borrow_id}`}>#{r.borrow_id}</Link></td>
                    <td>{r.late_days > 0 ? `${r.late_days} ngày` : 'Đúng hạn'}</td>
                    <td className="fw-semibold">
                      {r.fine_amount > 0 ? (
                        <>{formatMoney(r.fine_amount)} <span className="badge text-bg-warning ms-1">Chưa nộp</span></>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.some((r) => r.fine_amount > 0) && (
            <div className="card-footer bg-white">
              <Link to="/fines?status=UNPAID" className="btn btn-sm btn-outline-warning">
                <i className="bi bi-cash-coin me-1" />Đi thu tiền phạt
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
