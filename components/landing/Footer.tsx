import Link from "next/link";
import { Bot, Youtube, Twitter, Send } from "lucide-react";

import { BotLink } from "./BotLink";

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
                            <span>GPT Plus</span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            Ваш надежный проводник в мир искусственного интеллекта.
                            Доступ к передовым технологиям OpenAI без ограничений и сложностей.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Навигация</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-foreground transition-colors">Процесс активации</Link></li>
                            <li><Link href="#pricing" className="hover:text-foreground transition-colors">Тарифы</Link></li>
                            <li>
                                <a href="https://t.me/manager_gptsub" target="_blank" className="hover:text-foreground transition-colors">
                                    Задать вопрос
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Контакты</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <BotLink className="flex items-center gap-2 hover:text-foreground transition-colors">
                                    <Send size={16} /> @{process.env.NEXT_PUBLIC_BOT_USERNAME || 'gpt_subb_bot'}
                                </BotLink>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Requisites - Compact View */}
                <div className="border-t border-border py-8 text-xs text-muted-foreground/60">
                    <p className="font-semibold mb-2">Реквизиты:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p>ИП Киселев Владимир Ильич</p>
                        <p>ИНН: 525718619554</p>
                        <p>ОГРНИП: 325527500093012</p>
                        <p>Юридический адрес: г. Нижний Новгород, 603107, пр-кт Гагарина д.99 к2</p>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} GPT Plus. Все права защищены.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/rules" className="hover:text-foreground transition-colors">Пользовательское соглашение (оферта)</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
