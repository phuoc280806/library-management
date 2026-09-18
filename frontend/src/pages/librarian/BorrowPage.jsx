// Lập phiếu mượn: (1) tìm & chọn bạn đọc, (2) nhập các mã bản sao, (3) gửi.
// Backend kiểm tra mọi quy tắc (khoá, giới hạn, bản sao sẵn sàng) và trả lỗi rõ ràng.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as readersService from '../../services/readers.service';
import * as borrowsService from '../../services/borrows.service';
import { getErrorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';

export default function BorrowPage() {
  const navigate = useNavigate();

  // Bước 1: bạn đọc
  const [keyword, setKeyword] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [reader, setReader] = useState(null);
  const [searching, setSearching] = useState(false);

  // Bước 2: mã bản sao
  const [codeInput, setCodeInput] = useState('');
  const [codes, setCodes] = useState([]);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setError('');
    try {
      setCandidates(await readersService.searchReaders(keyword));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  function addCode(e) {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    if (codes.includes(code)) {
      setError(`Mã ${code} đã có trong danh sách`);
      return;
    }
    setCodes([...codes, code]);
    setCodeInput('');
    setError('');
  }

  function removeCode(code) {
    setCodes(codes.filter((c) => c !== code));
  }

  async function handleSubmit() {
    setBusy(true);
    setError('');
    try {
      const ticket = await borrowsService.createBorrow(reader.reader_id, codes);
      navigate(`/tickets/${ticket.borrow_id}`, { state: { created: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Lập phiếu mượn" />
      <Alert message={error} onClose={() => setError('')} />

      <div className="row g-3">
        {/* Cột trái: chọn bạn đọc */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <span className="badge text-bg-primary me-2">1</span>Bạn đọc
            </div>
            <div className="card-body">
              {reader ? (
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold fs-5">{reader.full_name}</div>
                    <div className="text-secondary">
                      Mã <code>{reader.reader_code}</code>
                      {reader.class_name && <> · Lớp {reader.class_name}</>}
                    </div>
                    {!reader.status && <span className="badge text-bg-danger mt-1">Tài khoản bị khoá</span>}
                    <div className="mt-2">
                      <Link to={`/readers/${reader.reader_id}/borrowings`} target="_blank" className="small">
                        Xem sách đang mượn <i className="bi bi-box-arrow-up-right" />
                      </Link>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setReader(null)}>
                    Đổi
                  </button>
                </div>
              ) : (
                <>
                  <form className="input-group mb-3" onSubmit={handleSearch}>
                    <input
                      className="form-control"
                      placeholder="Tên hoặc mã bạn đọc..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      autoFocus
                    />
                    <button className="btn btn-outline-primary" disabled={searching}>
                      {searching ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
                    </button>
                  </form>
                  {candidates.length > 0 && (
                    <div className="list-group" style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {candidates.map((r) => (
                        <button
                          key={r.reader_id}
                          type="button"
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          onClick={() => setReader(r)}
                          disabled={!r.status}
                        >
                          <span>
                            <span className="fw-semibold">{r.full_name}</span>
                            <span className="text-secondary small ms-2">{r.reader_code}{r.class_name ? ` · ${r.class_name}` : ''}</span>
                          </span>
                          {!r.status && <span className="badge text-bg-danger">Khoá</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: mã bản sao */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <span className="badge text-bg-primary me-2">2</span>Bản sao cần mượn
            </div>
            <div className="card-body">
              <form className="input-group mb-3" onSubmit={addCode}>
                <input
                  className="form-control"
                  placeholder="Nhập mã bản sao, VD: NV10-001"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <button className="btn btn-outline-primary">
                  <i className="bi bi-plus-lg" />
                </button>
              </form>

              {codes.length === 0 ? (
                <div className="text-secondary small">Chưa có bản sao nào. Mã in trên nhãn dán của mỗi cuốn sách.</div>
              ) : (
                <ul className="list-group">
                  {codes.map((c) => (
                    <li key={c} className="list-group-item d-flex justify-content-between align-items-center">
                      <code>{c}</code>
                      <button className="btn btn-sm btn-link text-danger" onClick={() => removeCode(c)}>
                        <i className="bi bi-x-lg" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-primary btn-lg" disabled={!reader || codes.length === 0 || busy} onClick={handleSubmit}>
            {busy && <span className="spinner-border spinner-border-sm me-2" />}
            <i className="bi bi-check-lg me-1" />
            Lập phiếu ({codes.length} cuốn)
          </button>
        </div>
      </div>
    </>
  );
}
