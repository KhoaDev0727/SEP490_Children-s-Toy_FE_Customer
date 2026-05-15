'use client';


export default function OfflinePage() {
    const handleRetry = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-body-sm">
            <main className="flex-grow flex items-center justify-center pt-[100px] pb-section-gap px-gutter w-full max-w-container-max mx-auto">
                <div className="flex flex-col items-center text-center max-w-md">
                    <div className="mb-stack-md w-64 h-64 relative flex items-center justify-center bg-surface-variant rounded-full p-8 shadow-inner overflow-hidden border border-outline-variant/30">
                        <img
                            alt="Toy plane grounded"
                            className="object-contain w-full h-full transform -rotate-12 mix-blend-multiply opacity-90"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtsLHp9f7LFqUBUN4Qg2VwSZJFq5BcBI-FElZwZ18GK5uWhe45DFdHFAmcF4QpqLR2dmB-Eg-wdlbIhzK-B6b412pkQDKORUgPFJDJTRHIHEmvW1QmE6uXu-mV2LPEATHq4n8cxWW00pi8o2ATddji_sDocJVzg1BSKH4z-L7EHu022MMSEgaEf5ongvqgjginoAv4KoJgz5QLzzfMACII4IvrU3CjyKMB-gO7U7LcWuy5iY1UQOgaP4wMDffFsl8I_lQig4YKcUo"
                        />
                        {/* Decorative disconnected waves */}
                        <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-50">
                            <div className="w-8 h-1 bg-error rounded-full rotate-45"></div>
                            <div className="w-6 h-1 bg-error rounded-full rotate-45 translate-x-2"></div>
                        </div>
                    </div>

                    {/* Typography */}
                    <h1 className="font-section-headline text-section-headline text-on-surface mb-stack-sm">
                        Connection to the Space Station was lost!
                    </h1>
                    <p className="font-body-sm text-body-sm text-secondary mb-stack-md px-4">
                        Please check your internet connection to continue shopping.
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={handleRetry}
                        className="bg-primary-container text-on-primary font-card-title text-card-title px-8 py-3 rounded-full shadow-lg shadow-primary-container/20 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">wifi_off</span>
                        Check connection again
                    </button>
                </div>
            </main>
        </div>
    );
}