# Kids Adventure World

Trò chơi học tập cho bé (Next.js), lấy cảm hứng từ cách chơi "học để mở khóa":
giải câu đố Toán lớp 1, Tiếng Việt, Tiếng Anh để nhận phần thưởng, rồi dùng phần thưởng mở khóa nhân vật, trang bị, bạn đồng hành và căn cứ.

## Chạy

```bash
cd kids-world
npm install
npm run dev   # http://localhost:3001
```

## Dạng bài tập

Mỗi lượt thử thách có 12 câu: đủ **6 dạng bài**, mỗi dạng 2 câu, thứ tự xáo trộn. Cả 15 chủ đề của Toán, Tiếng Việt, Tiếng Anh đều có đủ 6 dạng.

| Dạng | Cách chơi |
| --- | --- |
| 🔘 Chọn 1 đáp án | Chọn một đáp án đúng |
| ☑️ Chọn nhiều đáp án | Chọn tất cả các ô đúng (2–3 ô) |
| ✏️ Điền vào chỗ trống | Gõ số/chữ cái, hoặc chạm chọn từ trong ngân hàng từ |
| 🔗 Nối cặp | Chạm ô trái rồi ô phải để nối 4 cặp |
| 🖐️ Kéo thả | Kéo các ô vào đúng thứ tự (sắp xếp số, ghép câu, đánh vần); chạy được trên chuột và màn hình cảm ứng |
| 🎤 Luyện nói | Nói vào micro, chấm đúng/sai **từng âm tiết** (tiếng Anh) hoặc **từng tiếng** (tiếng Việt) |

**Luyện nói** dùng Web Speech API của trình duyệt (Chrome, Edge, Safari; Firefox chưa hỗ trợ), cần cho phép micro và có mạng.
Chuỗi nhận dạng được so khớp từng ký tự với từ mẫu (edit distance), rồi mỗi âm tiết được đánh xanh/đỏ.
Mỗi câu được nói tối đa 3 lần; nếu máy không có micro, bé có thể bỏ qua (không tính sai).
Ở Toán, bé đọc kết quả/số bằng tiếng Anh; ở Tiếng Việt, bé đọc từ hoặc câu và tiếng nào sai thanh sẽ bị đánh đỏ.

## Theme

Có 5 thế giới, đổi bằng nút **🎨 Đổi theme** (lựa chọn được lưu trong trình duyệt):

| Theme | Phần thưởng |
| --- | --- |
| 🚀 Phi hành gia vũ trụ (mặc định) | ⭐ ngôi sao |
| 🦖 Thung lũng khủng long | 🥚 trứng khủng long |
| 🐉 Hiệp sĩ & rồng | 🪙 xu vàng |
| ⚓ Thuyền trưởng đại dương | 🐚 vỏ sò |
| 👑 Công chúa phép thuật | 💎 ngọc ruby |

- Màu sắc, nền: CSS variables theo `[data-theme]` trong `app/globals.css`.
- Nội dung (tiêu đề, tên phòng, vật phẩm): `lib/themes.ts`. Muốn thêm theme thì thêm một mục vào `THEMES` và một khối `[data-theme="..."]` trong CSS.
- Đồ đã mở khóa lưu riêng cho từng theme; số phần thưởng dùng chung.

## Cấu trúc

- `lib/quiz/` – bộ sinh bài tập ngẫu nhiên (math, vietnamese, english); `build.ts` chứa các bộ sinh dùng chung cho nối cặp/chọn nhiều/sắp xếp
- `lib/speech.ts` – nhận dạng giọng nói và chấm theo âm tiết
- `components/exercises/` – giao diện từng dạng bài
- `components/GameProvider.tsx` – state game + theme, lưu vào `localStorage`
- `app/` – các màn hình: cổng, sảnh, thử thách, chủ đề, câu đố, phòng sưu tầm
