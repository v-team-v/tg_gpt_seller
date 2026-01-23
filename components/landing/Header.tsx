import Link from "next/link";
import { Bot } from "lucide-react";
import { BotLink } from "./BotLink";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Bot size={20} />
                    </div>
                    <span>ChatGPT Plus</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="#features" className="hover:text-primary transition-colors">Процесс активации</Link>
                    <Link href="#pricing" className="hover:text-primary transition-colors">Подписки</Link>
                    <Link href="#faq" className="hover:text-primary transition-colors">Вопросы</Link>

                </nav>

                <Link
                    href="#pricing"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Купить подписку
                </Link>
            </div>
        </header>
    );
}
