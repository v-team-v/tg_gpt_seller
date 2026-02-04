'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function TokenInstruction() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-sm text-blue-500 hover:text-blue-600">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Как получить токен?
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Инструкция по получению токена</DialogTitle>
                    <DialogDescription>
                        Для продления подписки нам необходим ваш Session Token. Следуйте инструкции ниже.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                            Откройте ChatGPT в браузере
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            Не используйте мобильное приложение — откройте ChatGPT в браузере (на компьютере или телефоне).
                        </p>
                        <div className="ml-8">
                            <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                                https://chatgpt.com <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                            Войдите в аккаунт
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            Нажмите кнопку <strong>Log in</strong> и введите свои данные для входа, если вы еще не авторизованы.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                            Перейдите по ссылке сессии
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            После входа в аккаунт откройте следующую ссылку в той же вкладке:
                        </p>
                        <div className="ml-8">
                            <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline break-all">
                                https://chatgpt.com/api/auth/session <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">4</span>
                            Скопируйте всё содержимое
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            Вы увидите страницу с кодом и текстом (пример ниже). Скопируйте <strong>ВСЁ</strong> содержимое этой страницы полностью.
                        </p>
                        <div className="ml-8 mt-2 border rounded-lg overflow-hidden relative aspect-video bg-muted">
                            <Image
                                src="/token_example.png"
                                alt="Пример токена"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
