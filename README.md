# Kids Adventure World

Trò chơi học tập cho bé (Next.js), lấy cảm hứng từ cách chơi "học để mở khóa":
giải câu đố Toán lớp 1, Tiếng Việt, Tiếng Anh để nhận phần thưởng, rồi dùng phần thưởng mở khóa nhân vật, trang bị, bạn đồng hành và căn cứ.

## Chạy

```bash
cd kids-world
npm install
npm run dev   # http://localhost:3001
```

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

- `lib/quiz/` – bộ sinh câu đố ngẫu nhiên (math, vietnamese, english)
- `components/GameProvider.tsx` – state game + theme, lưu vào `localStorage`
- `app/` – các màn hình: cổng, sảnh, thử thách, chủ đề, câu đố, phòng sưu tầm
