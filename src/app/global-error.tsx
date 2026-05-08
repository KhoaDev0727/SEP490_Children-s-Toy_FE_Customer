// app/error.tsx
'use client'; // Bắt buộc phải là Client Component cho file error trong App Router

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error500({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Tùy chọn: Ghi log lỗi vào các hệ thống tracking như Sentry ở đây
        console.error(error);
    }, [error]);

    return (
        <div className="bg-surface text-on-surface flex flex-col min-h-screen font-body-sm text-body-sm">
            <main className="flex-grow flex items-center justify-center p-gutter">
                <div className="max-w-md w-full text-center space-y-section-gap">
                    {/* Vùng hình ảnh */}
                    <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary-fixed rounded-full opacity-20 blur-2xl"></div>
                        {/* Sử dụng thẻ img tiêu chuẩn để tránh lỗi cấu hình next/image với external domain, 
                nếu muốn dùng <Image> của Next.js bạn cần config domain lh3.googleusercontent.com */}
                        <img
                            alt="Playful illustration of a messy toy workshop with gears, broken robot parts, and a wooden 'Under Repair' sign"
                            className="relative z-10 w-full h-full object-cover rounded-full shadow-lg"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsEnsvBSTIvQaevvFqLJ47k5fv1ZT98zyJRXG98GmC05hOu1miOIqJwYhp7Z78WkEr12x2SULvCGZVZCUlAoK-gv35foukjXGxura80kymxerIcztof-MNQnbgKFtwFGtrkQ_aeocIa4LwvdbumiXRZdNH2JzAqewxYs4OW9AzaBeHTmf6AS1o3bEA8bniy8dXQkkWRsmxPaMLUwr_GU_e5sGQzrlrtNKrLNUOxaZvvThKVln2FPCECL3Ws09egZpw2Ddn0ragSa8"
                        />
                    </div>

                    {/* Vùng nội dung chữ */}
                    <div className="space-y-stack-md">
                        <div className="inline-block px-3 py-1 bg-error-container text-on-error-container rounded-full font-label-caps text-label-caps">
                            LỖI 500
                        </div>
                        <h1 className="font-section-headline text-section-headline text-on-surface">
                            Hệ thống đang nghỉ ngơi một chút.
                        </h1>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                            Có lỗi kỹ thuật xảy ra từ phía chúng tôi. Đội ngũ kỹ thuật đang nhanh chóng khắc phục. Vui lòng thử lại sau giây lát.
                        </p>
                    </div>

                    {/* Vùng nút bấm */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-stack-md">
                        {/* Hàm reset() sẽ thử render lại segment bị lỗi */}
                        <button
                            onClick={() => reset()}
                            className="w-full sm:w-auto px-6 py-3 bg-primary-container text-on-primary font-card-title text-card-title rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                        >
                            Thử lại ngay
                        </button>

                        <Link
                            href="/"
                            className="flex justify-center items-center w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-outline text-on-surface font-card-title text-card-title rounded-lg hover:bg-surface-variant transition-colors duration-200"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}