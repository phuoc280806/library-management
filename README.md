# Hệ thống quản lý thư viện THPT

Đồ án môn Nhập môn Công nghệ phần mềm.

## Mục tiêu

Xây dựng ứng dụng web hỗ trợ quản lý thư viện của một trường trung học phổ thông.

## Đối tượng sử dụng

- Học sinh / Giáo viên
- Thủ thư
- Quản trị viên

## Công nghệ dự kiến

- Frontend: ReactJS
- Backend: Node.js + Express.js
- Database: MySQL

## Cấu trúc dự án

- `frontend`: giao diện người dùng
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
| 3 | Backend Express cơ bản, REST API | ⏳ Đang làm |
| 4 | Đăng nhập, JWT, phân quyền | ☐ |
| 5 | CRUD sách, CRUD bạn đọc | ☐ |
| 6 | Mượn sách | ☐ |
| 7 | Trả sách, tính tiền phạt | ☐ |
| 8 | Frontend React | ☐ |
| 9 | Dashboard, thống kê | ☐ |
| 10 | Testing, hoàn thiện báo cáo | ☐ |

## Cài đặt database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS library_management CHARACTER SET utf8mb4"
mysql -u root -p library_management < database/schema.sql
mysql -u root -p library_management < database/seed.sql
```