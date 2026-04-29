# CODING RULES & CONVENTIONS

Ap dung cho: SEP490 - Children's Toy Customer FE
Stack: Next.js 16 - React 19 - TypeScript 5 - TailwindCSS 4 - App Router

---

## 1. Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (site)/                 # Route group - public pages
│   ├── (auth)/                 # Route group - login/register
│   ├── globals.css
│   ├── layout.tsx              # Root layout (fonts, providers)
│   └── page.tsx                # Home page
│
├── features/                   # Feature-based modules (uu tien)
│   └── <feature>/
│       ├── components/         # UI components cua feature
│       ├── hooks/              # Custom hooks (useFeature.ts)
│       ├── services/           # API calls (feature-api.ts)
│       └── types/              # TypeScript interfaces + schemas
│
├── components/                 # Shared/reusable UI components
│   ├── ui/                     # Primitives (Button, Modal, Popover...)
│   ├── common/                 # Layout chung (Header, Footer, EmptyState...)
│   └── ...
│
├── configs/                    # Config files (axios, env helpers...)
├── context/                    # React context providers
├── hooks/                      # Global shared hooks
├── icons/                      # SVG icon components
├── layout/                     # Layout building blocks
└── types/                      # Shared TypeScript types

public/                         # Static assets
```

Rules:
- Feature-first: moi tinh nang tao folder trong src/features/<feature>/
- Khong import cheo giua features
- Shared logic -> src/hooks, shared UI -> src/components
- Path alias @/ tro toi src/ (da cau hinh trong tsconfig.json)

---

## 2. Naming Convention

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | Header.tsx, ProductCard.tsx |
| Page component | PascalCase | page.tsx (Next.js rule) |
| Custom Hook | use + PascalCase | useProducts.ts |
| Service file | kebab-case | product-api.ts |
| Schema file | kebab-case + .schema | product.schema.ts |
| Type/Interface | PascalCase | Product, CartItem |
| Variable/function | camelCase | handleSearch |
| Constant | UPPER_SNAKE_CASE | MAX_ITEMS |
| Context | PascalCase + Context | CartContext |

Server vs Client Component:
- Server: khong co directive
- Client: bat buoc co "use client" o dong dau

---

## 3. Component Rules

- Dung Server Component mac dinh neu khong can state/event
- Chi them "use client" o cap thap nhat can thiet
- 1 component = 1 nhiem vu
- Neu >150 lines thi tach nho
- Props phai co type ro rang, khong dung any

Key rules:
- Khong dung index lam key trong list
- Dung ID duy nhat tu data

---

## 4. Custom Hooks

- Dat trong features/<feature>/hooks/ hoac src/hooks neu dung chung
- Hook chi chua logic, khong chua JSX
- Return object (khong dung tuple)

---

## 5. Data Fetching Strategy

- Server-first: dung fetch() trong Server Component neu co the
- Client-side: neu can interactivity, dua logic vao hook
- Neu dung axios, tao src/configs/axios-client.ts va khong import axios truc tiep trong component

---

## 6. Styles

- Dung Tailwind utility, han che inline style
- Neu bat buoc inline style, dong bo mau sac theo design tokens
- Khong tu dat class name tuy y ngoai Tailwind

---

## 7. Quality Rules

- Khong commit file bi thua hoac demo placeholder
- Cap nhat README khi thay doi entry point hoac script
- Thong nhat format import va sap xep dependency
