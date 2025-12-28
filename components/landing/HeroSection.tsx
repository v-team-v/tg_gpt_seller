import { BotLink } from "./BotLink";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Sparkles size={16} className="text-primary" />
                    <span>Доступ ко всем возможностям AI</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    ChatGPT Plus <br />
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        без ограничений
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    Получите доступ к GPT-4o, DALL-E 3 и анализу данных прямо сейчас.
                    Оплата российскими картами, мгновенная активация.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <BotLink className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                        Купить подписку
                        <ArrowRight size={18} />
                    </BotLink>
                    <a
                        href="#pricing"
                        className="h-12 px-8 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                        Посмотреть тарифы
                    </a>
                </div>
            </div>
        </section>
    );
}
