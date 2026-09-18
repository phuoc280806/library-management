// Tiêu đề trang + chỗ đặt nút hành động bên phải (vd. "Thêm sách")
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h4 className="mb-0">{title}</h4>
        {subtitle && <div className="text-secondary small">{subtitle}</div>}
      </div>
      {children && <div className="d-flex gap-2">{children}</div>}
    </div>
  );
}
