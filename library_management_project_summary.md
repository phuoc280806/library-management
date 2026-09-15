# Tóm tắt dự án: Hệ thống Quản lý Thư viện THPT

## 1. Bối cảnh đồ án

- Học phần: **Nhập môn Công nghệ phần mềm**
- Đề tài: **Hệ thống Quản lý Thư viện cho một trường Trung học Phổ thông**
- Hình thức sản phẩm: **Ứng dụng web**
- Mục tiêu:
  - Quản lý sách, tài liệu và bạn đọc.
  - Quản lý nghiệp vụ mượn / trả sách.
  - Theo dõi sách quá hạn và tiền phạt.
  - Giảm thao tác thủ công của thư viện.
  - Tăng độ chính xác và thuận tiện trong công tác quản lý.

---

## 2. Các nhóm người dùng

### 2.1. Bạn đọc
Bao gồm:
- Học sinh
- Giáo viên

Chức năng dự kiến:
- Đăng nhập.
- Tra cứu sách / tài liệu.
- Kiểm tra tình trạng sách còn hay đã được mượn.
- Xem sách đang mượn.
- Xem lịch sử mượn / trả.
- Xem khoản tiền phạt do trả sách trễ.

### 2.2. Thủ thư
Chức năng dự kiến:
- Quản lý sách.
- Nhập sách mới.
- Quản lý từng bản sao của một đầu sách.
- Quản lý bạn đọc.
- Lập phiếu mượn sách.
- Xử lý trả sách.
- Tính và ghi nhận tiền phạt.
- Thu tiền phạt.
- Xem báo cáo và thống kê.

### 2.3. Quản trị viên
Chức năng dự kiến:
- Quản lý tài khoản.
- Phân quyền người dùng.
- Khóa / mở tài khoản.
- Thay đổi quy định thư viện:
  - Số sách tối đa được mượn.
  - Số ngày được phép mượn.
  - Tiền phạt mỗi ngày quá hạn.

---

## 3. Công nghệ dự kiến

### Frontend
- **ReactJS**
- Có thể dùng:
  - Bootstrap
  - hoặc Tailwind CSS

### Backend
- **Node.js**
- **Express.js**

### Database
- **MySQL**

### Các công cụ hỗ trợ
- Visual Studio Code
- Git
- GitHub
- Postman

### Authentication
- JWT

### Kiểu giao tiếp
- REST API
- JSON

---

## 4. Kiến trúc tổng thể

```text
Người dùng
    ↓
Frontend - React
    ↓
REST API / JSON
    ↓
Backend - Node.js + Express
    ↓
MySQL
```

Ví dụ tra cứu sách:

```text
Người dùng nhập "Toán 10"
        ↓
React gửi request
        ↓
Backend nhận request
        ↓
Backend truy vấn MySQL
        ↓
MySQL trả dữ liệu
        ↓
Backend trả JSON
        ↓
React hiển thị kết quả
```

---

## 5. Cấu trúc thư mục dự án

Cấu trúc hiện tại:

```text
library-management/
├── backend/
├── database/
├── docs/
├── frontend/
├── .gitignore
└── README.md
```

Do Git không theo dõi thư mục rỗng, có thể thêm `.gitkeep`:

```text
library-management/
├── backend/
│   └── .gitkeep
├── database/
│   └── .gitkeep
├── docs/
│   └── .gitkeep
├── frontend/
│   └── .gitkeep
├── .gitignore
└── README.md
```

---

## 6. Nội dung `.gitignore` đề xuất

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Build
dist/
build/

# Editor
.vscode/

# OS files
.DS_Store
Thumbs.db
```

---

## 7. Nội dung README.md ban đầu

```markdown
# Hệ thống quản lý thư viện THPT

Đồ án môn Nhập môn Công nghệ phần mềm.

## Mô tả

Xây dựng ứng dụng web hỗ trợ quản lý thư viện của một trường
Trung học Phổ thông.

Hệ thống hỗ trợ quản lý sách, bạn đọc, mượn - trả sách,
tiền phạt và các quy định của thư viện.

## Đối tượng sử dụng

- Học sinh / Giáo viên
- Thủ thư
- Quản trị viên

## Công nghệ dự kiến

- Frontend: ReactJS
- Backend: Node.js + Express.js
- Database: MySQL

## Cấu trúc dự án

- `frontend/`: giao diện người dùng
- `backend/`: API và xử lý nghiệp vụ
- `database/`: cơ sở dữ liệu
- `docs/`: tài liệu phân tích và thiết kế
```

---

## 8. Thiết kế database dự kiến

Các bảng chính:

```text
ROLES
USERS
READERS
CATEGORIES
BOOKS
BOOK_COPIES
BORROW_TICKETS
BORROW_DETAILS
FINES
REGULATIONS
```

### ROLES
```text
role_id
role_name
```

Giá trị dự kiến:
- READER
- LIBRARIAN
- ADMIN

### USERS
```text
user_id
username
password_hash
full_name
email
phone
role_id
status
created_at
```

### READERS
```text
reader_id
user_id
reader_code
reader_type
class_name
date_of_birth
```

`reader_type`:
- STUDENT
- TEACHER

### CATEGORIES
```text
category_id
category_name
description
```

### BOOKS
Đây là đầu sách.

```text
book_id
isbn
title
author
publisher
publish_year
category_id
description
```

### BOOK_COPIES
Quản lý từng cuốn vật lý riêng biệt.

```text
copy_id
book_id
copy_code
status
location
created_at
```

Trạng thái dự kiến:
- AVAILABLE
- BORROWED
- LOST
- DAMAGED

### BORROW_TICKETS
```text
borrow_id
reader_id
librarian_id
borrow_date
due_date
status
```

Trạng thái:
- BORROWING
- COMPLETED
- OVERDUE

### BORROW_DETAILS
```text
borrow_detail_id
borrow_id
copy_id
return_date
status
```

### FINES
```text
fine_id
borrow_detail_id
late_days
amount
reason
status
paid_at
```

Trạng thái:
- UNPAID
- PAID

### REGULATIONS
```text
regulation_id
max_books
borrow_days
fine_per_day
updated_at
updated_by
```

---

## 9. Quan hệ database dự kiến

```text
ROLES
  │
  │ 1:N
  ▼
USERS
  │
  │ 1:1
  ▼
READERS
  │
  │ 1:N
  ▼
BORROW_TICKETS
  │
  │ 1:N
  ▼
BORROW_DETAILS ─────── BOOK_COPIES
  │                        │
  │                        │ N:1
  ▼                        ▼
FINES                    BOOKS
                           │
                           │ N:1
                           ▼
                       CATEGORIES
```

---

## 10. Một số business rule dự kiến

- Một bạn đọc chỉ được mượn tối đa số sách theo quy định hiện hành.
- Thời gian mượn lấy từ bảng `REGULATIONS`.
- Sách có trạng thái `BORROWED` thì không được mượn tiếp.
- Khi trả sách:
  - Nếu trả đúng hạn → không phạt.
  - Nếu trả trễ → tính số ngày trễ.
- Công thức tiền phạt:

```text
Tiền phạt = Số ngày trễ × Tiền phạt mỗi ngày
```

- Không nên hard-code các tham số như:
  - 5 cuốn
  - 14 ngày
  - 2.000đ/ngày

Mà nên lấy từ bảng `REGULATIONS`.

---

## 11. API dự kiến

### Authentication
```text
POST /api/auth/login
GET  /api/auth/profile
POST /api/auth/logout
```

### Sách
```text
GET    /api/books
GET    /api/books/:id
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id
```

### Bạn đọc
```text
GET    /api/readers
GET    /api/readers/:id
POST   /api/readers
PUT    /api/readers/:id
```

### Mượn sách
```text
POST /api/borrow
GET  /api/borrow/:id
GET  /api/readers/:id/borrowings
```

### Trả sách
```text
PUT /api/borrow/:id/return
```

---

## 12. Cấu trúc thư mục dự kiến khi bắt đầu code thật

```text
library-management/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   ├── auth/
│       │   ├── reader/
│       │   ├── librarian/
│       │   └── admin/
│       ├── services/
│       ├── contexts/
│       ├── routes/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── utils/
│   │   └── app.js
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── diagrams/
│
├── docs/
│   ├── requirements/
│   ├── use-case/
│   ├── diagrams/
│   ├── api/
│   └── report/
│
├── .gitignore
└── README.md
```

---

## 13. Kiến thức cần học để làm dự án

Thứ tự ưu tiên:

1. Git và GitHub
2. JavaScript cơ bản
3. SQL / MySQL
4. ERD và thiết kế database
5. Node.js
6. Express.js
7. REST API
8. Postman
9. ReactJS
10. Authentication
11. JWT
12. Authorization / phân quyền
13. Tích hợp Frontend + Backend
14. Testing cơ bản

---

## 14. JavaScript cần học

- `let`, `const`
- kiểu dữ liệu
- `if / else`
- `for`
- array
- object
- function
- arrow function
- destructuring
- spread operator
- `map`
- `filter`
- `find`
- Promise
- `async / await`
- `try / catch`
- JSON

Ví dụ nghiệp vụ đơn giản:

```javascript
const borrowedBooks = 3;
const maxBooks = 5;

if (borrowedBooks < maxBooks) {
  console.log("Được phép mượn thêm sách");
} else {
  console.log("Đã đạt giới hạn mượn sách");
}
```

---

## 15. Git cần biết

Lệnh cơ bản:

```bash
git init
git status
git add .
git commit -m "..."
git push
git pull
```

Sau đó học thêm:

```bash
git branch
git switch
git merge
```

Workflow nhóm nên theo kiểu:

```text
main
│
├── develop
├── feature/login
├── feature/book-management
├── feature/borrow-return
└── feature/admin
```

---

## 16. REST API cần nhớ

```text
GET     lấy dữ liệu
POST    thêm dữ liệu
PUT     cập nhật
PATCH   cập nhật một phần
DELETE  xóa
```

HTTP status code quan trọng:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

---

## 17. Authentication và Authorization

### Authentication
Xác định:
> Người dùng là ai?

Ví dụ:
- username
- password
- JWT

### Authorization
Xác định:
> Người dùng được phép làm gì?

Ví dụ:
- Học sinh được xem sách.
- Học sinh không được xóa sách.
- Thủ thư được quản lý sách.
- Admin được quản lý tài khoản và quy định.

---

## 18. Lộ trình triển khai dự án

### Milestone 1
- Tạo cấu trúc project
- Git
- README
- `.gitignore`

### Milestone 2
- Thiết kế database
- ERD
- Tạo schema MySQL

### Milestone 3
- Backend cơ bản
- Express
- REST API
- Postman

### Milestone 4
- Đăng nhập
- JWT
- Phân quyền

### Milestone 5
- CRUD sách
- CRUD bạn đọc

### Milestone 6
- Mượn sách

### Milestone 7
- Trả sách
- Tính tiền phạt

### Milestone 8
- Frontend React

### Milestone 9
- Dashboard
- Thống kê

### Milestone 10
- Testing
- Sửa lỗi
- Hoàn thiện báo cáo

---

## 19. Công cụ AI hiện có

Người thực hiện đang có:
- ChatGPT Plus
- Gemini Pro
- Claude Pro

Cách dùng đề xuất:

### ChatGPT
- Hướng dẫn kiến trúc
- Giải thích kiến thức
- Thiết kế database
- Debug
- Hướng dẫn code từng bước
- Review báo cáo

### Claude
- Review code dài
- Tìm lỗi logic
- Kiểm tra tính nhất quán
- Review tài liệu

### Gemini
- Cross-check thiết kế
- Gợi ý phương án khác
- Kiểm tra edge case

Không nên để cả 3 AI cùng viết một module theo 3 phong cách khác nhau.

---

## 20. Tình trạng hiện tại

Đã làm:
- Chốt đề tài là **Quản lý thư viện trường THPT**.
- Chốt hướng công nghệ:
  - React
  - Node.js + Express
  - MySQL
- Đã tạo thư mục dự án trong VS Code:

```text
library-management/
├── backend/
├── database/
├── docs/
├── frontend/
├── .gitignore
└── README.md
```

- Đang ở giai đoạn rất đầu của dự án.
- Chưa bắt đầu React.
- Chưa bắt đầu Backend.
- Chưa bắt đầu MySQL.
- Đang hoàn thiện cấu trúc project và Git trước.

---

## 21. Bước tiếp theo nên làm

Bắt đầu từ phần đơn giản nhất.

Trình tự đề xuất:

1. Điền nội dung `.gitignore`.
2. Điền `README.md`.
3. Thêm `.gitkeep` nếu các thư mục còn trống.
4. Chạy:

```bash
git init
git status
git add .
git commit -m "chore: initialize project structure"
```

5. Sau khi Git ổn, bắt đầu học **JavaScript cơ bản bằng các ví dụ trực tiếp từ nghiệp vụ thư viện**.
6. Sau JavaScript cơ bản thì chuyển sang **MySQL + thiết kế database**.

---

## 22. Yêu cầu khi tiếp tục ở chat mới

Hãy tiếp tục hướng dẫn theo phong cách:
- Đi từ dễ đến khó.
- Mỗi bước nhỏ, làm xong mới sang bước tiếp theo.
- Giải thích rõ vì sao phải làm.
- Ưu tiên kiến thức cần thiết cho chính dự án này.
- Không tạo toàn bộ hệ thống một lần.
- Dùng ví dụ liên quan trực tiếp đến thư viện THPT.
- Khi đưa code, giải thích file đó dùng để làm gì và code hoạt động như thế nào.
