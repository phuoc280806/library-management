const bcrypt = require('bcrypt');
const readersRepo = require('../repositories/readers.repository');
const AppError = require('../utils/AppError');
const runInTransaction = require('../utils/transaction');

const READER_TYPES = ['STUDENT', 'TEACHER'];

async function search(keyword) {
  return readersRepo.findAll(keyword);
}

async function getById(id) {
  const reader = await readersRepo.findById(id);
  if (!reader) throw new AppError('Không tìm thấy bạn đọc', 404);
  return reader;
}

async function create(data) {
  const { username, password, full_name, reader_code, reader_type } = data;
  if (!username || !full_name || !reader_code) {
    throw new AppError('Thiếu username, full_name hoặc reader_code', 400);
  }
  if (!READER_TYPES.includes(reader_type)) {
    throw new AppError('reader_type phải là STUDENT hoặc TEACHER', 400);
  }
  if (await readersRepo.existsUsername(username)) throw new AppError('Username đã tồn tại', 409);
  if (await readersRepo.existsReaderCode(reader_code)) throw new AppError('Mã bạn đọc đã tồn tại', 409);

  // Không gửi password -> mật khẩu ban đầu = mã bạn đọc (thủ thư sẽ báo cho học sinh đổi sau)
  const password_hash = await bcrypt.hash(password || reader_code, 10);

  // 2 INSERT phải cùng thành công: nếu readers lỗi (vd. reader_code trùng do race) mà users đã ghi
  // thì sẽ có 1 tài khoản "mồ côi" không phải bạn đọc -> transaction
  const readerId = await runInTransaction(async (conn) => {
    const user_id = await readersRepo.createUser({ ...data, password_hash }, conn);
    return readersRepo.createReader({ ...data, user_id }, conn);
  });

  return readersRepo.findById(readerId);
}

async function update(id, data) {
  const current = await getById(id);
  if (!data.full_name) throw new AppError('Thiếu full_name', 400);
  if (!READER_TYPES.includes(data.reader_type)) {
    throw new AppError('reader_type phải là STUDENT hoặc TEACHER', 400);
  }
  // status: 1 hoạt động / 0 khoá. Không gửi thì giữ nguyên
  const status = data.status === undefined ? current.status : Number(data.status);

  await runInTransaction(async (conn) => {
    await readersRepo.updateUser(current.user_id, { ...data, status }, conn);
    await readersRepo.updateReader(id, data, conn);
  });

  return readersRepo.findById(id);
}

module.exports = { search, getById, create, update };
