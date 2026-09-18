import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import { READER_TYPES, ROLE_LABELS } from '../utils/constants';

function Row({ label, value }) {
  return (
    <tr>
      <th className="text-secondary fw-normal" style={{ width: 180 }}>{label}</th>
      <td>{value || '—'}</td>
    </tr>
  );
}

export default function ProfilePage() {
  const { user, isReader } = useAuth();
  const readerType = READER_TYPES.find((t) => t.value === user.reader_type)?.label;

  return (
    <>
      <PageHeader title="Hồ sơ của tôi" />
      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <table className="table table-borderless mb-0">
            <tbody>
              <Row label="Họ tên" value={user.full_name} />
              <Row label="Tên đăng nhập" value={user.username} />
              <Row label="Vai trò" value={ROLE_LABELS[user.role]} />
              <Row label="Email" value={user.email} />
              <Row label="Điện thoại" value={user.phone} />
              {isReader && (
                <>
                  <Row label="Mã bạn đọc" value={user.reader_code} />
                  <Row label="Loại bạn đọc" value={readerType} />
                  <Row label="Lớp" value={user.class_name} />
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
