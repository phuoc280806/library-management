// Xem 1 phiếu mượn. Có :id trên URL thì tải luôn; không thì hiện ô nhập số phiếu.
// Bạn đọc cũng dùng được trang này (qua link ở "Sách đang mượn") nhưng chỉ xem phiếu của mình (backend chặn).
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as borrowsService from '../../services/borrows.service';
import { getErrorMessage } from '../../services/api';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

export default function TicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState(id || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setTicket(null);
      return;
    }
    setLoading(true);
    setError('');
    borrowsService
      .getTicket(id)
      .then(setTicket)
      .catch((err) => {
        setTicket(null);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleSearch(e) {
    e.preventDefault();
    if (input.trim()) navigate(`/tickets/${input.trim()}`);
  }

  return (
    <>
      <PageHeader title="Phiếu mượn" />

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-12 col-md-4 col-lg-3">
          <div className="input-group">
            <span className="input-group-text">#</span>
            <input
              type="number"
              min="1"
              className="form-control"
              placeholder="Số phiếu"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn btn-outline-primary"><i className="bi bi-search" /></button>
          </div>
        </div>
      </form>

      {location.state?.created && <Alert type="success" message="Lập phiếu thành công" />}
      <Alert message={error} />

      {loading && <Loading />}

      {ticket && (
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <span className="fw-semibold fs-5">Phiếu #{ticket.borrow_id}</span>
              <span className="ms-2"><StatusBadge status={ticket.status} /></span>
            </div>
            <div className="text-secondary small">
              Bạn đọc: <strong className="text-body">{ticket.reader}</strong>
              <span className="mx-2">·</span>Mượn: {formatDateTime(ticket.borrow_date)}
              <span className="mx-2">·</span>Hạn trả: <strong className="text-body">{formatDate(ticket.due_date)}</strong>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã bản sao</th>
                  <th>Tên sách</th>
                  <th>Trạng thái</th>
                  <th>Ngày trả</th>
                  <th>Tiền phạt</th>
                </tr>
              </thead>
              <tbody>
                {ticket.items.map((it) => (
                  <tr key={it.borrow_detail_id}>
                    <td><code>{it.copy_code}</code></td>
                    <td className="fw-semibold">{it.title}</td>
                    <td><StatusBadge status={it.status} /></td>
                    <td>{formatDateTime(it.return_date)}</td>
                    <td>
                      {it.fine ? (
                        <>
                          {formatMoney(it.fine.amount)}
                          <span className="text-secondary small ms-1">({it.fine.late_days} ngày)</span>
                          <span className="ms-2"><StatusBadge status={it.fine.status} /></span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
