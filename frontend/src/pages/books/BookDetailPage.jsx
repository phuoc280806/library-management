import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as booksService from '../../services/books.service';
import { getErrorMessage } from '../../services/api';
import { categoryName } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

function Row({ label, value }) {
  return (
    <tr>
      <th className="text-secondary fw-normal" style={{ width: 160 }}>{label}</th>
      <td>{value || '—'}</td>
    </tr>
  );
}

export default function BookDetailPage() {
  const { id } = useParams(); // lấy :id từ URL /books/2
  const { isStaff } = useAuth();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    booksService.getBook(id).then(setBook).catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (error) return <Alert message={error} />;
  if (!book) return <Loading />;

  return (
    <>
      <PageHeader title={book.title} subtitle={`Mã sách #${book.book_id}`}>
        <Link to="/books" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />Quay lại
        </Link>
        {isStaff && (
          <Link to={`/books/${book.book_id}/edit`} className="btn btn-primary">
            <i className="bi bi-pencil me-1" />Sửa
          </Link>
        )}
      </PageHeader>

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <table className="table table-borderless mb-0">
            <tbody>
              <Row label="ISBN" value={book.isbn} />
              <Row label="Tác giả" value={book.author} />
              <Row label="Nhà xuất bản" value={book.publisher} />
              <Row label="Năm xuất bản" value={book.publish_year} />
              <Row label="Thể loại" value={categoryName(book.category_id)} />
              <Row
                label="Tình trạng"
                value={
                  book.available > 0 ? (
                    <span className="badge text-bg-success">Còn {book.available} bản có thể mượn</span>
                  ) : (
                    <span className="badge text-bg-secondary">Đã hết, chờ trả</span>
                  )
                }
              />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
