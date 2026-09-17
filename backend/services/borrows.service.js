// Nghiệp vụ mượn / trả sách. Đây là nơi áp dụng quy định của thư viện.
const repo = require('../repositories/borrows.repository');
const AppError = require('../utils/AppError');
const runInTransaction = require('../utils/transaction');

// PHẦN A — MƯỢN SÁCH
async function borrow({ reader_id, librarian_id, copy_codes }) {
  if (!reader_id) throw new AppError('Thiếu reader_id', 400);
  if (!librarian_id) throw new AppError('Thiếu librarian_id', 400);
  if (!Array.isArray(copy_codes) || copy_codes.length === 0) {
    throw new AppError('copy_codes phải là mảng có ít nhất 1 mã bản sao', 400);
  }

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const borrowId = await runInTransaction(async (conn) => {
    // A1. Quy định hiện hành
    const rule = await repo.findEffectiveRegulation(today, conn);
    if (!rule) throw new AppError('Chưa có quy định mượn sách có hiệu lực', 500);

    // A2. Bạn đọc tồn tại và không bị khoá
    const reader = await repo.findReader(reader_id, conn);
    if (!reader) throw new AppError('Không tìm thấy bạn đọc', 404);
    if (!reader.user_status) throw new AppError('Tài khoản bạn đọc đang bị khoá', 403);

    // A3. Không vượt quá max_books (tính cả số cuốn sắp mượn)
    const holding = await repo.countHolding(reader_id, conn);
    if (holding + copy_codes.length > rule.max_books) {
      throw new AppError(
        `Vượt giới hạn: đang giữ ${holding}, muốn mượn ${copy_codes.length}, tối đa ${rule.max_books}`,
        400
      );
    }

    // A4. Từng bản sao phải AVAILABLE (FOR UPDATE khoá dòng tới khi commit/rollback)
    const copies = [];
    for (const code of copy_codes) {
      const copy = await repo.findCopyForUpdate(code, conn);
      if (!copy) throw new AppError(`Không tìm thấy bản sao ${code}`, 404);
      if (copy.status !== 'AVAILABLE') {
        throw new AppError(`Bản sao ${code} (${copy.title}) không sẵn sàng: ${copy.status}`, 400);
      }
      copies.push(copy);
    }

    // A5. Ghi 3 nơi. Bất kỳ dòng nào ném lỗi -> rollback toàn bộ ở runInTransaction
    const id = await repo.createTicket(
      { readerId: reader_id, librarianId: librarian_id, borrowDays: rule.borrow_days },
      conn
    );
    for (const copy of copies) {
      await repo.createDetail(id, copy.copy_id, conn);
      await repo.updateCopyStatus(copy.copy_id, 'BORROWED', conn);
    }
    return id;
  });

  return getTicket(borrowId);
}

// PHẦN B — TRẢ 1 BẢN SAO
async function returnCopy({ copy_code }) {
  if (!copy_code) throw new AppError('Thiếu copy_code', 400);

  return runInTransaction(async (conn) => {
    // B1 + B2. Dòng đang mượn + số ngày trễ (tính sẵn trong SQL)
    const detail = await repo.findActiveDetailByCopyCode(copy_code, conn);
    if (!detail) throw new AppError(`Bản sao ${copy_code} không ở trạng thái đang mượn`, 400);

    // Phạt theo quy định có hiệu lực lúc MƯỢN (giống test_borrow_return.sql);
    // phiếu cũ hơn mọi quy định thì dùng quy định hôm nay
    const today = new Date().toISOString().slice(0, 10);
    const rule =
      (await repo.findEffectiveRegulation(detail.borrow_date.slice(0, 10), conn)) ||
      (await repo.findEffectiveRegulation(today, conn));
    if (!rule) throw new AppError('Chưa có quy định mượn sách có hiệu lực', 500);

    const lateDays = detail.late_days;
    const amount = lateDays * Number(rule.fine_per_day); // DECIMAL trả về dạng chuỗi '2000.00'

    // B3. Ghi nhận trả
    await repo.closeDetail(detail.borrow_detail_id, conn);
    await repo.updateCopyStatus(detail.copy_id, 'AVAILABLE', conn);
    if (lateDays > 0) {
      await repo.createFine({ detailId: detail.borrow_detail_id, lateDays, amount }, conn);
    }
    await repo.completeTicketIfDone(detail.borrow_id, conn);

    return { borrow_id: detail.borrow_id, copy_code, late_days: lateDays, fine_amount: amount };
  });
}

// Xem phiếu: gom các dòng (1 dòng / cuốn) thành 1 object phiếu + mảng items
// `viewer` = req.user (không truyền = gọi nội bộ, không kiểm tra quyền)
async function getTicket(borrowId, viewer) {
  const rows = await repo.findTicketById(borrowId);
  if (rows.length === 0) throw new AppError('Không tìm thấy phiếu mượn', 404);

  const { borrow_id, reader_id, reader, borrow_date, due_date, ticket_status } = rows[0];

  // Bạn đọc chỉ được xem phiếu của chính mình.
  // Trả 404 thay vì 403 để không tiết lộ "phiếu này tồn tại nhưng của người khác".
  if (viewer && viewer.role === 'READER') {
    const myReaderId = await repo.findReaderIdByUserId(viewer.user_id);
    if (myReaderId !== reader_id) throw new AppError('Không tìm thấy phiếu mượn', 404);
  }
  return {
    borrow_id,
    reader_id,
    reader,
    borrow_date,
    due_date,
    status: ticket_status,
    items: rows.map((r) => ({
      borrow_detail_id: r.borrow_detail_id,
      copy_code: r.copy_code,
      title: r.title,
      status: r.detail_status,
      return_date: r.return_date,
      fine: r.fine_amount == null ? null : { late_days: r.late_days, amount: r.fine_amount, status: r.fine_status },
    })),
  };
}

async function listOverdue() {
  return repo.findOverdue();
}

// Bạn đọc chỉ xem được của mình; thủ thư/admin xem của bất kỳ ai
async function listBorrowingOfReader(readerId, viewer) {
  if (viewer.role === 'READER') {
    const myReaderId = await repo.findReaderIdByUserId(viewer.user_id);
    if (myReaderId !== Number(readerId)) throw new AppError('Không tìm thấy bạn đọc', 404);
  }
  return repo.findBorrowingByReader(readerId);
}

module.exports = { borrow, returnCopy, getTicket, listOverdue, listBorrowingOfReader };
