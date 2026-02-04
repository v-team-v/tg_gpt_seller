'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { TokenInstruction } from './TokenInstruction';
import { createWebOrder } from '@/app/actions/web-order';
import { Loader2, Check } from 'lucide-react';
import { ProductData } from '../data';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    type: string;
}

interface BuyProductModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productData?: ProductData;
    features?: string[]; // Kept for backward compat if needed, but productData takes precedence
}

export function BuyProductModal({ product, open, onOpenChange, productData }: BuyProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'details' | 'form'>('details');

    // Form states
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [sessionToken, setSessionToken] = useState('');
    const [yandexClientId, setYandexClientId] = useState<string | undefined>();

    // Fetch ClientID on mount
    useState(() => {
        if (typeof window !== 'undefined' && (window as any).ym) {
            try {
                // @ts-ignore
                (window as any).ym(106059751, 'getClientID', (clientID) => {
                    setYandexClientId(clientID);
                });
            } catch (e) {
                console.error('Failed to get ClientID', e);
            }
        }
    });

    if (!product) return null;

    const title = productData?.displayTitle || product.title;
    const description = productData?.description || product.description;
    const features = productData?.features || product.description.split('\n');

    // Determine if token is required. Default to product type check if no config.
    const requiresToken = productData?.requiresToken ?? (product.type === 'SUBSCRIPTION');

    const handleNextStep = () => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.ym) {
            // @ts-ignore
            window.ym(106059751, 'reachGoal', 'begin_checkout_site');
        }
        setStep('form');
        setError(null);
    };

    const handleBuy = async () => {
        setError(null);

        if (!firstName.trim()) {
            setError('Введите Имя');
            return;
        }

        if (!email.trim()) {
            setError('Введите Email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Некорректный формат Email');
            return;
        }

        if (requiresToken && !sessionToken.trim()) {
            setError('Введите Токен');
            return;
        }

        setLoading(true);

        try {
            // Get ClientID if not already set (fallback)
            let currentClientId = yandexClientId;
            if (!currentClientId && typeof window !== 'undefined' && (window as any).ym) {
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(() => resolve(), 500);
                    try {
                        // @ts-ignore
                        (window as any).ym(106059751, 'getClientID', (id) => {
                            currentClientId = id;
                            clearTimeout(timeout);
                            resolve();
                        });
                    } catch { resolve(); }
                });
            }

            const result = await createWebOrder({
                productId: product.id,
                email,
                firstName,
                sessionToken: requiresToken ? sessionToken : undefined,
                yandexClientId: currentClientId
            });

            if (result.error) {
                setError(result.error);
            } else if (result.url) {
                // @ts-ignore
                if (typeof window !== 'undefined' && window.ym) {
                    // @ts-ignore
                    window.ym(106059751, 'reachGoal', 'go_to_pay');
                }
                window.location.href = result.url;
            }
        } catch (e) {
            setError('Ошибка при оформлении заказа');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset state on close
            setTimeout(() => {
                setStep('details');
                setError(null);
                setEmail('');
                setFirstName('');
                setSessionToken('');
            }, 300);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[92dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {step === 'details' ? title : 'Оформление подписки'}
                    </DialogTitle>
                </DialogHeader>

                {step === 'details' ? (
                    <div className="py-3">
                        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                            {description}
                        </p>

                        {features && features.length > 0 && (
                            <div className="bg-muted/30 p-3 rounded-xl space-y-2 mb-4">
                                {features.map((feature, i) => (
                                    feature.trim() && (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span>{feature.trim().replace(/^[-•*]\s*/, '')}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        <div className="bg-blue-50 p-3 rounded-xl mb-4 text-sm text-blue-800">
                            <p className="mb-1 font-medium">После оплаты вы увидите сообщение с номером заказа.</p>
                            <p className="mb-1">Сообщите номер заказа менеджеру любым способом:</p>
                            <div className="flex flex-col gap-1">
                                <a href="https://t.me/manager_gptsub" target="_blank" className="font-bold hover:underline">
                                    Telegram: manager_gptsub
                                </a>
                                <a href="mailto:manager.gptsub@gmail.com" className="font-bold hover:underline">
                                    Email: manager.gptsub@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-muted-foreground">Стоимость:</span>
                            <span className="text-2xl font-bold">{Math.round(product.price)} ₽</span>
                        </div>

                        <DialogFooter className="gap-4 sm:gap-4 mt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                                Отмена
                            </Button>
                            <Button onClick={handleNextStep} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                Выбрать этот товар
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        <div className="bg-muted p-3 rounded-lg text-sm">
                            <div className="font-medium">{title}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold">{Math.round(product.price)} ₽</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="firstName">Ваше имя</Label>
                            <Input
                                id="firstName"
                                placeholder="Иван"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">На этот email придет чек и информация о заказе</p>
                        </div>

                        {requiresToken && (
                            <div className="space-y-2 pt-2 border-t mt-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="token" className="font-semibold">Токен</Label>
                                    <TokenInstruction />
                                </div>
                                <Input
                                    id="token"
                                    placeholder="Скопируйте токен полностью..."
                                    value={sessionToken}
                                    onChange={(e) => setSessionToken(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Необходим для продления подписки на вашем аккаунте.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                                onClick={handleBuy}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                Перейти к оплате {product.price} ₽
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setStep('details')}
                                disabled={loading}
                            >
                                Назад
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
