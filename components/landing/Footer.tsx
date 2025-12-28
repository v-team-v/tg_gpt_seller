import Link from "next/link";
import { Bot, Youtube, Twitter, Send } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/50 border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <Bot size={20} />
                            </div>
                            <span>ChatGPT Plus</span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            Ваш надежный проводник в мир искусственного интеллекта.
                            Доступ к передовым технологиям OpenAI без ограничений и сложностей.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Навигация</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-foreground transition-colors">Преимущества</Link></li>
                            <li><Link href="#pricing" className="hover:text-foreground transition-colors">Тарифы</Link></li>
                            <li><Link href="/admin" prefetch={false} className="hover:text-foreground transition-colors">Вход для админа</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Контакты</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <a href="https://t.me/gpt_sub_bot" target="_blank" className="flex items-center gap-2 hover:text-foreground transition-colors">
                                    <Send size={16} /> gpt_sub_bot
                                </a>
                            </li>
                            <li>E-mail: support@chatgpt-plus.ru</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} ChatGPT Plus. Все права защищены.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/rules" className="hover:text-foreground transition-colors">Пользовательское соглашение</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
