export default function Loading({ text = 'Đang tải...' }) {
  return (
    <div className="d-flex align-items-center justify-content-center py-5 text-secondary">
      <div className="spinner-border me-2" role="status" />
      <span>{text}</span>
    </div>
  );
}
