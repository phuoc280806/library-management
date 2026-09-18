// Modal xác nhận điều khiển bằng state React (không cần JS của Bootstrap):
// show=true -> thêm class "show d-block" để hiện.
export default function ConfirmModal({ show, title, children, confirmText = 'Đồng ý', confirmColor = 'danger', busy, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel} disabled={busy} />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
                Huỷ
              </button>
              <button type="button" className={`btn btn-${confirmColor}`} onClick={onConfirm} disabled={busy}>
                {busy && <span className="spinner-border spinner-border-sm me-1" />}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
