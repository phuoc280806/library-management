// Hộp thông báo Bootstrap. Không có message thì không render gì.
export default function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} ${onClose ? 'alert-dismissible' : ''}`} role="alert">
      {message}
      {onClose && <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng" />}
    </div>
  );
}
