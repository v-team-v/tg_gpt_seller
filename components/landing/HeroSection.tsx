import { BotLink } from "./BotLink";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
            {/* Background gradients - completely removed for performance */}
            {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 blur-[60px] rounded-full pointer-events-none" /> */}
            {/* <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-secondary/20 blur-[50px] rounded-full pointer-events-none" /> */}

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                    Поможем с оплатой <br />
                    ChatGPT Plus в России <br />
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        Продлим подписку или <br />
                        активируем новый <br />
                        аккаунт
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    Оплата российскими картами или по QR коду
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <BotLink className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                        Оформить через Telegram
                        <ArrowRight size={18} />
                    </BotLink>
                    <a
                        href="#pricing"
                        className="h-12 px-8 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                        Оплатить картой на сайте
                    </a>
                </div>
            </div>
        </section>
    );
}
