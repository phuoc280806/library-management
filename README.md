# Hệ thống quản lý thư viện THPT

Đồ án môn Nhập môn Công nghệ phần mềm.

## Mục tiêu

Xây dựng ứng dụng web hỗ trợ quản lý thư viện của một trường trung học phổ thông.

## Đối tượng sử dụng

- Học sinh / Giáo viên
- Thủ thư
- Quản trị viên

## Công nghệ

- Frontend: ReactJS (Vite) + Bootstrap 5
- Backend: Node.js + Express.js
- Database: MySQL

## Cấu trúc dự án

- `frontend`: giao diện người dùng (React + Bootstrap)
  - `src/services`: gọi REST API (axios, tự gắn JWT)
  - `src/contexts`: trạng thái đăng nhập dùng chung
  - `src/pages`: mỗi màn hình một file (`auth/`, `books/`, `librarian/`)
  - `src/layouts`, `src/components`: khung trang và mảnh UI dùng lại
- `backend`: xử lý nghiệp vụ và API
- `database`: cơ sở dữ liệu
  - `schema.sql`: cấu trúc 10 bảng
  - `seed.sql`: dữ liệu mẫu
  - `test_borrow_return.sql`: diễn tập luồng mượn → trả → phạt bằng SQL
- `docs`: tài liệu phân tích và thiết kế (`ERD.png`, `ERD.mwb`)

## Tiến độ

| Milestone | Nội dung | Trạng thái |
|---|---|---|
| 1 | Cấu trúc project, Git, README | ✅ Xong |
| 2 | ERD, schema MySQL, seed, test SQL | ✅ Xong |
| 3 | Backend Express cơ bản, REST API | ✅ Xong |
| 4 | Đăng nhập, JWT, phân quyền | ✅ Xong |
| 5 | CRUD sách, CRUD bạn đọc | ✅ Xong |
| 6 | Mượn sách | ✅ Xong |
| 7 | Trả sách, tính tiền phạt | ✅ Xong |
| 8 | Frontend React + Bootstrap | ✅ Xong |
| 9 | Dashboard, thống kê | ⏳ Tiếp theo |
| 10 | Testing, hoàn thiện báo cáo | ☐ |

## Cài đặt database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS library_management CHARACTER SET utf8mb4"
mysql -u root -p library_management < database/schema.sql
mysql -u root -p library_management < database/seed.sql
```

## Chạy ứng dụng

Cần 2 terminal (backend cổng 3000, frontend cổng 5173):

```bash
# Terminal 1 — backend (cần file backend/.env, xem backend/.env.example)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (cần file frontend/.env, xem frontend/.env.example)
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173. Tài khoản mẫu (mật khẩu `123456`):

| Tài khoản | Vai trò |
|---|---|
| `admin` | Quản trị viên |
| `thuthu01` | Thủ thư |
| `hs10a1_001` | Học sinh (bạn đọc) |