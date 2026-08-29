# Portfolio Nguyễn Quý Anh (Mason)

Đây là website Portfolio + CV online của bạn, gồm **2 phiên bản thiết kế** dùng chung một nguồn nội dung. **Bản Nổi bật (`/bold/`) đã được chọn làm bản chính** — file `index.html` ở thư mục gốc tự động chuyển hướng vào đó.

- **`/bold/`** (bản chính) — bản "Nổi bật": nền tối, hiệu ứng gradient động, nút "hút" theo chuột, ảnh dự án nghiêng theo chuột (tilt).
- **`/minimal/`** (giữ lại để đối chiếu) — bản "Tinh tế": nền sáng, nhiều khoảng trắng, cuộn mượt, số liệu đếm chạy khi cuộn tới, con trỏ chuột tuỳ chỉnh.

Cả 2 bản đều là **HTML/CSS/JS thuần** — không cần cài Node.js, không cần "build", mở file là chạy.

---

## 1. Xem thử ngay trên máy (không cần biết lập trình)

Mở Finder, vào thư mục `portfolio-mason`, double-click file **`index.html`** ở thư mục gốc → tự chuyển vào bản Nổi bật.

Muốn xem lại bản Tinh tế: vào thư mục `minimal`, double-click file `index.html` bên trong.

> Mẹo: nút tròn ghi **EN / VI** ở góc trên bên phải để đổi ngôn ngữ toàn trang. Ngôn ngữ bạn chọn sẽ được nhớ cho lần mở sau.

---

## 2. Cấu trúc thư mục

```
portfolio-mason/
├── data/
│   ├── content.json     ← TOÀN BỘ nội dung (tên, kinh nghiệm, dự án, số liệu...)
│   └── content.js        ← bản sao tự động của content.json, website đọc file này
├── assets/
│   ├── images/            ← ảnh chân dung, ảnh dự án
│   └── cv/                 ← 2 file CV PDF (tiếng Việt & tiếng Anh) để tải về
├── minimal/                ← bản "Tinh tế" (index.html + css/ + js/)
├── bold/                   ← bản "Nổi bật" (index.html + css/ + js/)
├── scripts/                ← script Python dùng để tạo content.js và CV PDF (không cần đụng tới)
└── README.md                ← chính là file bạn đang đọc
```

**Vì sao có cả `content.json` lẫn `content.js`?** Trình duyệt (đặc biệt Chrome) chặn việc đọc file JSON khi mở trực tiếp bằng double-click (không qua server), nên trang web thực ra đọc `content.js`. File `content.json` mới là bản **gốc, dễ đọc** — nếu sau này bạn (hoặc một AI assistant/lập trình viên) sửa nội dung, hãy sửa trong `content.json` rồi chạy lại:

```bash
python3 scripts/build_content_js.py
```

để đồng bộ sang `content.js`. Nếu chỉ sửa `content.json` mà quên bước này, thay đổi sẽ **không** hiện lên website.

---

## 3. Deploy miễn phí (đăng website lên mạng, có link để chia sẻ)

Chọn 1 trong 3 cách sau — đều miễn phí và không cần biết lập trình.

### Cách 1 — Netlify Drop (dễ nhất, kéo-thả)

1. Mở trình duyệt vào [app.netlify.com/drop](https://app.netlify.com/drop)
2. Kéo **cả thư mục `portfolio-mason`** thả vào trang đó — **luôn kéo cả thư mục này**, không kéo riêng `bold` hay `minimal`, vì 2 bản đó dùng chung ảnh/dữ liệu nằm ở thư mục cha (`assets/`, `data/`); kéo riêng sẽ bị thiếu ảnh và thiếu nội dung.
3. Đợi vài giây, Netlify sẽ đưa cho bạn 1 link dạng `https://ten-ngau-nhien.netlify.app` — link gốc này tự chuyển vào bản Nổi bật. Muốn xem bản Tinh tế thì vào thêm `/minimal/` phía sau link.
4. (Tuỳ chọn) Đăng ký tài khoản Netlify miễn phí để đổi tên link cho đẹp hơn, dễ nhớ hơn.

### Cách 2 — Vercel

1. Vào [vercel.com](https://vercel.com), đăng nhập bằng GitHub/Google.
2. Chọn **Add New → Project → Upload** (hoặc kéo-thả thư mục tương tự Netlify).
3. Deploy xong sẽ có link dạng `https://ten-du-an.vercel.app`.

### Cách 3 — GitHub Pages (nếu bạn đã có tài khoản GitHub)

1. Tạo 1 repository mới trên GitHub, đặt tên tuỳ ý (ví dụ `portfolio`).
2. Tải toàn bộ nội dung thư mục `portfolio-mason` lên repository đó (dùng nút "Add file → Upload files" trên GitHub, kéo-thả từng thư mục con vào).
3. Vào **Settings → Pages** của repository, chọn nhánh `main` và thư mục gốc `/ (root)`, bấm **Save**.
4. Sau khoảng 1 phút, GitHub sẽ cho bạn link dạng `https://ten-ban.github.io/portfolio/` — link gốc tự chuyển vào bản Nổi bật; thêm `/minimal/` vào cuối để xem bản Tinh tế.

> Dự án đã có sẵn Git repo cục bộ (đã `git init` + commit). Nếu bạn dùng Cách 3, có thể bỏ qua bước upload thủ công và thay bằng `git remote add origin <link-repo-github-cua-ban> && git push -u origin main` từ trong thư mục `portfolio-mason`.

> Cả 3 cách trên chỉ đăng file tĩnh, không có bước "build" nào — đúng như thư mục bạn có sẵn.

---

## 4. Nút "Tải CV" trỏ tới đâu?

Nút Tải CV tải file PDF trong `assets/cv/`:

- `NguyenQuyAnh-CV-VI.pdf` — khi trang đang ở tiếng Việt
- `NguyenQuyAnh-CV-EN.pdf` — khi trang đang ở tiếng Anh

2 file này được tạo tự động từ đúng nội dung trong `content.json`, nên luôn khớp với những gì hiển thị trên web. Nếu bạn muốn dùng một file CV thiết kế riêng (ví dụ file CV bạn tự làm bằng Canva/Word), chỉ cần **thay thế** 2 file PDF này bằng file của bạn nhưng **giữ nguyên tên file** — website sẽ tự động dùng file mới mà không cần sửa code.

---

## 5. Muốn sửa nội dung sau này?

Cách an toàn nhất: đưa thư mục `portfolio-mason` này cho một AI coding assistant (như Claude Code) hoặc một lập trình viên, và nói rõ muốn sửa gì (ví dụ "đổi số điện thoại", "thêm 1 dự án mới vào phần Projects"). Họ chỉ cần sửa trong `data/content.json` rồi chạy lại `scripts/build_content_js.py` — nội dung sẽ tự cập nhật ở **cả 2 bản thiết kế cùng lúc**, không bị lệch nhau.

---

## 6. Đã kiểm tra

- Mở trực tiếp bằng double-click, không lỗi console.
- Responsive tốt ở 375px (điện thoại), 768px (tablet), 1440px (desktop).
- Animation tự tắt khi máy bật "Reduce Motion" (Cài đặt hệ điều hành → Trợ năng).
- Chuyển ngôn ngữ Việt/Anh mượt, không tải lại trang.
