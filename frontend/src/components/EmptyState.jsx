export default function EmptyState({ icon = 'bi-inbox', text = 'Không có dữ liệu' }) {
  return (
    <div className="text-center text-secondary py-5">
      <i className={`bi ${icon} fs-1 d-block mb-2`} />
      {text}
    </div>
  );
}
