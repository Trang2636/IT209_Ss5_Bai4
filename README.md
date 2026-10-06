# Báo Cáo Bài Tập 4: Mô Phỏng Quy Trình Hotfix & Gitflow Thực Tế

## 1. Thông Tin Bài Tập
- **Chủ đề**: Áp dụng mô hình phân nhánh Gitflow chuẩn trong quản lý vòng đời phần mềm (Software Lifecycle Management).
- **Mục tiêu**:
  - Thực hành quy trình ứng cứu sự cố khẩn cấp trên Production thông qua nhánh **Hotfix**.
  - Thực hiện tách nhánh hotfix từ `main`, khắc phục lỗi và gộp (merge) trở lại `main` kèm tạo Git Tag.
  - Đồng bộ hóa bản vá (backport/sync) ngược lại vào nhánh `develop` để chống trôi lỗi (prevent bug regression).
- **Thư mục nộp bài**: `homework/session_05/ex4/`

---

## 2. Bối Cảnh Bài Toán & Các Ràng Buộc

### Bối cảnh thực tế
- Hệ thống đang chạy ổn định trên nhánh `main` ở phiên bản phát hành **`v1.0.0`**.
- Đội ngũ phát triển đang tiếp tục làm việc trên nhánh **`develop`** với nhiều tính năng mới đang dang dở (Work In Progress - WIP), chưa hoàn thiện và tuyệt đối không thể deploy lên Production ngay lúc này.
- **Sự cố nghiêm trọng**: Môi trường Production phát hiện lỗ hổng bảo mật rò rỉ thông tin nhạy cảm của người dùng (`passwordHash`, `token`) trong API lấy thông tin hồ sơ. Cần một bản vá khẩn cấp ngay lập tức!

### Các ràng buộc kỹ thuật
1. Nhánh sửa lỗi khẩn cấp **`hotfix/v1.0.1`** phải được tách trực tiếp từ nhánh **`main`** (tại commit đang chạy trên Production).
2. Sau khi sửa xong, gộp nhánh `hotfix/v1.0.1` vào `main` và đánh dấu phiên bản bằng tag **`v1.0.1`** để triển khai bản vá.
3. Bắt buộc phải gộp ngược lại nhánh `hotfix/v1.0.1` vào nhánh **`develop`** để đảm bảo các tính năng mới trong tương lai thừa hưởng bản vá này, tránh việc lỗi xuất hiện trở lại khi release phiên bản tiếp theo.

---

## 3. Sơ Đồ Quy Trình Gitflow Hotfix (ASCII Art)

```text
  (Tag: v1.0.0)                                    (Tag: v1.0.1)
main:     ●───────────────────────────────────────────────● (Merge Hotfix)
           \                                             / ^
            \ (Tách hotfix)                             /  |
hotfix:      \───► ● [fix: user data leak] ────────────/   |
                    \                                      |
                     \──────────────────────────────┐      |
                                                    ▼      |
develop:  ●────────────● (feat: feature A WIP) ────● (Merge Hotfix into develop)
```

### Minh họa chi tiết dòng chảy commit:
```text
*   4e7a2b9 (HEAD -> develop) Merge branch 'hotfix/v1.0.1' into develop
|\  
| * b3a1c0d fix: resolve user data leak vulnerability
| | *   9c2d1ef (tag: v1.0.1, main) Merge branch 'hotfix/v1.0.1' into main
| | |\  
| | |/  
| |/|   
* | |   a5f6e7d feat: dang phat trien tinh nang moi tren develop (WIP)
| |/    
|/|     
* |     1f2e3d4 (tag: v1.0.0) chore: release v1.0.0
|/  
*       0b8a7c6 Initial commit
```

---

## 4. Các Bước Thực Hiện Chi Tiết (Step-by-Step)

### Bước 1: Thiết lập trạng thái ban đầu của hệ thống
Hệ thống ban đầu có commit release `v1.0.0` trên nhánh `main`:
```bash
# Khởi tạo commit release v1.0.0 trên nhánh main
git checkout main
git tag -a v1.0.0 -m "Release version 1.0.0"

# Tạo nhánh develop để phát triển tính năng cho phiên bản tiếp theo
git checkout -b develop

# Đội ngũ đang phát triển dở dang tính năng mới trên develop
echo "// Tinh nang dang phat trien dở dang" >> feature-new.js
git add feature-new.js
git commit -m "feat: dang phat trien tinh nang moi tren develop (WIP)"
```

---

### Bước 2: Phát hiện sự cố khẩn cấp -> Tách nhánh `hotfix/v1.0.1` từ `main`
Tuyệt đối không tách từ `develop` vì `develop` đang chứa code chưa hoàn thiện. Phải checkout về `main` để tách nhánh hotfix:
```bash
# Chuyển về nhánh main
git checkout main

# Tách nhánh hotfix mới trực tiếp từ main
git checkout -b hotfix/v1.0.1
```

---

### Bước 3: Sửa lỗi bảo mật trên nhánh `hotfix/v1.0.1`
Chỉnh sửa code trong module `user-controller.js`, loại bỏ việc trả về dữ liệu nhạy cảm:
```bash
# Thực hiện commit bản vá lỗi
git add user-controller.js
git commit -m "fix: resolve user data leak vulnerability"
```

---

### Bước 4: Tích hợp Hotfix vào nhánh `main` và đánh Tag `v1.0.1`
Chuyển về nhánh `main`, thực hiện gộp nhánh với cờ `--no-ff` (No Fast-Forward) để tạo merge commit rõ ràng, sau đó đánh tag phiên bản:
```bash
# Chuyển về main
git checkout main

# Gộp hotfix vào main
git merge --no-ff hotfix/v1.0.1 -m "Merge branch 'hotfix/v1.0.1' into main"

# Tạo tag phiên bản hotfix v1.0.1
git tag -a v1.0.1 -m "Release Hotfix v1.0.1 - Fix security leak"
```

---

### Bước 5: Gộp ngược Hotfix vào nhánh `develop` (Đồng bộ hóa bản vá)
Để tránh trôi lỗi (bug regression) khi nhánh `develop` được merge vào `main` trong các đợt phát hành tương lai, ta chuyển sang `develop` và merge nhánh hotfix:
```bash
# Chuyển về nhánh develop
git checkout develop

# Gộp bản vá hotfix vào develop
git merge --no-ff hotfix/v1.0.1 -m "Merge branch 'hotfix/v1.0.1' into develop"
```

---

### Bước 6: Dọn dẹp nhánh Hotfix cục bộ
Sau khi bản vá đã được tích hợp thành công vào cả `main` và `develop`, ta xóa bỏ nhánh hotfix tạm thời:
```bash
git branch -d hotfix/v1.0.1
```

---

## 5. Kết Quả Kiểm Tra Đạt Yêu Cầu

### Lệnh 1: Kiểm tra các nhánh hiện có
```bash
git branch -a
```
**Output mô phỏng:**
```text
* develop
  main
```
*(Nhánh `hotfix/v1.0.1` đã được gộp hoàn tất và xóa sạch)*

---

### Lệnh 2: Kiểm tra danh sách Git Tag
```bash
git tag -n
```
**Output mô phỏng:**
```text
v1.0.0          Release version 1.0.0
v1.0.1          Release Hotfix v1.0.1 - Fix security leak
```
✅ **Đạt yêu cầu**: Tag `v1.0.1` đã được tạo thành công và trỏ vào commit mới nhất trên `main`.

---

### Lệnh 3: Kiểm tra sơ đồ lịch sử gộp nhánh (Git Graph)
```bash
git log --graph --oneline --all
```
**Output mô phỏng:**
```text
*   4e7a2b9 (HEAD -> develop) Merge branch 'hotfix/v1.0.1' into develop
|\  
| * b3a1c0d fix: resolve user data leak vulnerability
| | *   9c2d1ef (tag: v1.0.1, main) Merge branch 'hotfix/v1.0.1' into main
| | |\  
| | |/  
| |/|   
* | |   a5f6e7d feat: dang phat trien tinh nang moi tren develop (WIP)
| |/    
|/|     
* |     1f2e3d4 (tag: v1.0.0) chore: release v1.0.0
|/  
*       0b8a7c6 Initial commit
```

✅ **Đạt yêu cầu**:
- Nhánh `main` có commit merge mang tag `v1.0.1`.
- Lịch sử nhánh `develop` đã chứa commit sửa lỗi `b3a1c0d` từ hotfix mà không làm gián đoạn commit tính năng dở dang `a5f6e7d`.

---

## 6. Phân Tích & Bài Học Kinh Nghiệm

| Vấn đề | Nếu không áp dụng đúng Gitflow Hotfix | Áp dụng đúng Gitflow Hotfix |
|---|---|---|
| **Nơi bắt đầu sửa lỗi** | Sửa trực tiếp trên `develop` rồi deploy -> Lôi theo toàn bộ tính năng chưa xong, gây crash hệ thống Production. | Tách từ `main` -> Chỉ chứa đúng code Production và code sửa lỗi, an toàn tuyệt đối khi release khẩn cấp. |
| **Đồng bộ về develop** | Quên không gộp về `develop` -> Khi release phiên bản tiếp theo từ develop, lỗi rò rỉ dữ liệu cũ lại xuất hiện trở lại (Regression bug). | Merge ngược về `develop` -> Bản vá được kế thừa xuyên suốt toàn bộ các phiên bản tương lai. |
| **Dấu vết phát hành** | Không đánh tag -> Khó truy vết mã nguồn chính xác của phiên bản chạy trên server khi cần rollback hoặc debug. | Đánh tag `v1.0.1` rõ ràng -> Quản lý phiên bản chặt chẽ theo chuẩn Semantic Versioning (SemVer). |
