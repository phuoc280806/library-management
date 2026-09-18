import { STATUS } from '../utils/constants';

// 'UNPAID' -> <span class="badge bg-warning">Chưa nộp</span>
export default function StatusBadge({ status }) {
  const info = STATUS[status] || { label: status, color: 'secondary' };
  return <span className={`badge text-bg-${info.color}`}>{info.label}</span>;
}
