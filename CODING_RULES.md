# CODING RULES & CONVENTIONS

**Project**: SEP490 - Children's Toy Customer FE
**Stack**: Next.js 16 - React 19 - TypeScript 5 - TailwindCSS 4 - App Router

---

## 1. Folder Structure (Feature-First Architecture)

Tuân thủ cấu trúc thư mục rõ ràng để dễ dàng mở rộng và bảo trì.

```
src/
├── app/                        # Next.js App Router (Routing, Layouts, Pages)
│   ├── (site)/                 # Route group - public pages (Home, Products, About)
│   ├── (auth)/                 # Route group - authentication (Login, Register)
│   ├── (customer)/             # Route group - customer specific (Profile, Orders)
│   ├── globals.css             # Global styles & Tailwind directives
│   ├── layout.tsx              # Root layout (Fonts, Providers)
│   └── page.tsx                # Trang chủ (redirect hoặc home content)
│
├── features/                   # Module hóa theo tính năng (Ưu tiên hàng đầu)
│   └── <feature-name>/         # Ví dụ: auth, products, cart, orders
│       ├── components/         # UI components riêng cho feature
│       ├── hooks/              # Custom hooks cho logic của feature
│       ├── services/           # API calls (feature-api.ts)
│       ├── types/              # TypeScript interfaces & Zod schemas
│       └── utils/              # Helper functions nội bộ feature
│
├── components/                 # UI components dùng chung (Global)
│   ├── ui/                     # Primitives/Atomic (Button, Input, Modal - Shadcn-like)
│   ├── common/                 # Layout chung (Header, Footer, Sidebar)
│   └── shared/                 # Business components dùng ở nhiều features
│
├── configs/                    # Cấu hình (axios-client, env, constants)
├── context/                    # React Context Providers (Auth, Theme, Sidebar)
├── hooks/                      # Custom hooks dùng chung toàn dự án
├── layout/                     # Hợp phần xây dựng Layout (MainLayout, AuthLayout)
├── lib/                        # Thư viện bên thứ 3 (utils, formatters)
├── types/                      # Định nghĩa types dùng chung (Common API response)
└── public/                     # Static assets (Images, Icons, Fonts)
```

**Nguyên tắc vàng:**
- **Feature-first:** Mọi logic mới nên bắt đầu trong một folder `features`.
- **Isolation:** Không import chéo giữa các `features`. Nếu cần dùng chung, đưa vào `src/components/shared` hoặc `src/hooks`.
- **Path Alias:** Luôn dùng `@/` để trỏ tới thư mục `src`.

---

## 2. Naming Conventions

| Đối tượng | Quy tắc | Ví dụ |
| :--- | :--- | :--- |
| **Component** | PascalCase | `ProductCard.tsx`, `Header.tsx` |
| **Page/Layout** | PascalCase | `page.tsx`, `layout.tsx` (Next.js default) |
| **Custom Hook** | camelCase (`use` prefix) | `useAuth.ts`, `useProductDetail.ts` |
| **Service File** | kebab-case | `product-api.ts`, `auth-service.ts` |
| **Schema File** | kebab-case + `.schema` | `login.schema.ts`, `product.schema.ts` |
| **Type/Interface**| PascalCase | `IProduct`, `UserResponse` |
| **Variable/Func** | camelCase | `isLoaded`, `handleCheckout()` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL`, `PAGE_SIZE` |

---

## 3. Component Rules (React 19 & Next.js 16)

- **Server Components (RSC):** Sử dụng mặc định cho tất cả các trang và components không cần interactivity (state, effects).
- **Client Components:** Chỉ thêm `"use client"` ở component cấp thấp nhất có thể.
- **Props:** Phải định nghĩa interface rõ ràng. **Nghiêm cấm dùng `any`**.
- **Performance:** Sử dụng `memo` cho các components nặng, `useCallback` cho các function truyền xuống con.
- **Clean Code:** Nếu component vượt quá 150 dòng, hãy cân nhắc tách nhỏ.

---

## 4. API & Data Fetching

- **Axios Client:** Sử dụng `src/configs/axios-client.ts` đã được cấu hình sẵn Interceptors để xử lý Token và Error.
- **Services:** Đặt trong `features/<feature>/services/`. Tên function nên rõ nghĩa: `getProducts()`, `updateProfile()`.
- **Error Handling:** Luôn bọc API call trong `try-catch`. Sử dụng `react-hot-toast` để hiển thị thông báo cho người dùng.
- **Result Pattern:** Phối hợp với Backend để handle các mã lỗi (400, 401, 403, 500) một cách nhất quán.

---

## 5. Form Handling & Validation

- **Thư viện:** Bắt buộc dùng `react-hook-form` kết hợp với `zod`.
- **Workflow:**
    1. Định nghĩa schema trong `types/<feature>.schema.ts`.
    2. Infer type từ schema: `type FormData = z.infer<typeof schema>`.
    3. Sử dụng `useForm` với `zodResolver`.
- **Validation:** Thông báo lỗi phải thân thiện với người dùng (tiếng Việt).

---

## 6. Styles & UI (TailwindCSS 4)

- **Utility First:** Sử dụng Tailwind class cho mọi styling. Hạn chế tối đa inline-style.
- **Design Tokens:** Sử dụng các biến màu và spacing được định nghĩa trong `globals.css` (Tailwind 4 CSS-first configuration).
- **Responsive:** Phát triển theo hướng **Mobile-first**. Sử dụng các prefix `sm:`, `md:`, `lg:`, `xl:`.
- **Typography:** Font chủ đạo là `Inter`. Sử dụng `Material Symbols` cho hệ thống icon.

---

## 7. SEO & Metadata

- **Static Metadata:** Định nghĩa trong `layout.tsx` hoặc `page.tsx` cho các trang tĩnh.
- **Dynamic Metadata:** Sử dụng `generateMetadata()` cho các trang chi tiết sản phẩm, bài viết để tối ưu SEO.
- **Semantic HTML:** Sử dụng đúng thẻ (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<h1>`-`<h6>`) để cải thiện khả năng đọc của bot tìm kiếm.

---

## 8. Development Workflow

- **Backend Sync:** Thường xuyên cập nhật các Interface/Types dựa trên Swagger/Schema của dự án Backend C#.
- **Git Commit:** Tuân thủ [Conventional Commits](https://www.conventionalcommits.org/):
    - `feat:` tính năng mới.
    - `fix:` sửa lỗi.
    - `refactor:` cấu trúc lại code.
    - `docs:` cập nhật tài liệu.
- **Cleanup:** Trước khi commit, hãy chạy `npm run lint` để đảm bảo code sạch. Xóa bỏ `console.log` và code thừa.

---

*Tài liệu này là bắt buộc cho tất cả thành viên tham gia phát triển dự án Customer FE.*
