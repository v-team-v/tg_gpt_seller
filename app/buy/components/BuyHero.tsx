import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BuyHero() {
    return (
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
            {/* No background blobs as per new design request for clean look matching landing */}

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        Продлим подписку Plus <br className="hidden md:block" />
                        на вашем аккаунте без входа <br className="hidden md:block" />
                        или активируем новый аккаунт
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    Оплата российскими картами или по QR коду
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="#products"
                        className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                    >
                        Купить подписку
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
