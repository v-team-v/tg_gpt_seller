'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWebOrder, checkPromoCode } from '@/app/actions/web-order';
import { Loader2 } from 'lucide-react';

interface WebCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        title: string;
        price: number;
    };
}

export function WebCheckoutModal({ isOpen, onClose, product }: WebCheckoutModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [promoCode, setPromoCode] = useState('');

    // Promo state
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

    // Order state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setPromoError(null);
            setAppliedPromo(null);
            setPromoCode('');
            // Optional: reset name/email or keep them
        }
    }, [isOpen]);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        setIsCheckingPromo(true);
        setPromoError(null);
        setAppliedPromo(null);

        try {
            const res = await checkPromoCode(promoCode.trim());
            if (res.valid && res.discountAmount !== undefined) {
                setAppliedPromo({ code: res.code!, discount: res.discountAmount });
            } else {
                setPromoError(res.error || 'Неверный промокод');
            }
        } catch (e) {
            setPromoError('Ошибка проверки');
        } finally {
            setIsCheckingPromo(false);
        }
    };

    const handlePay = async () => {
        if (!email) {
            setError('Введите Email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Некорректный формат Email');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Get ClientID from Yandex Metrika if available
        let yandexClientId: string | undefined;
        try {
            // @ts-ignore
            if (window.ym) {
                // @ts-ignore
                window.ym(106059751, 'getClientID', (clientID) => {
                    yandexClientId = clientID;
                });
            }
        } catch (e) {
            console.error('Failed to get ClientID', e);
        }

        // Wait a bit for callback if needed, or proceed. 
        // Sync ym call usually works fast enough or we accept it might be missed if async.
        // Actually, ym getClientID is async callback. We need to wrap it or use a slight delay? 
        // For simplicity, let's wrap in a promise with timeout.

        try {
            if (!yandexClientId && typeof window !== 'undefined' && (window as any).ym) {
                yandexClientId = await new Promise<string | undefined>((resolve) => {
                    const timeout = setTimeout(() => resolve(undefined), 500);
                    try {
                        // @ts-ignore
                        window.ym(106059751, 'getClientID', (id) => {
                            clearTimeout(timeout);
                            resolve(id);
                        });
                    } catch { resolve(undefined); }
                });
            }

            const res = await createWebOrder({
                productId: product.id,
                email,
                firstName: name,
                promoCode: appliedPromo?.code,
                yandexClientId
            });

            if (res.success && res.url) {
                // @ts-ignore
                if (typeof window !== 'undefined' && window.ym) {
                    // @ts-ignore
                    window.ym(106059751, 'reachGoal', 'go_to_pay');
                }

                // Redirect to Robokassa
                window.location.href = res.url;
            } else {
                setError(res.error || 'Ошибка создания заказа');
                setIsLoading(false);
            }
        } catch (e) {
            setError('Произошла ошибка при отправке данных');
            setIsLoading(false);
        }
    };

    const finalPrice = appliedPromo
        ? Math.max(0, product.price - appliedPromo.discount)
        : product.price;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Оформление подписки</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Items */}
                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <div className="font-medium">{product.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                            {appliedPromo ? (
                                <>
                                    <span className="line-through text-muted-foreground">{Math.round(product.price)} ₽</span>
                                    <span className="font-bold text-green-600">{Math.round(finalPrice)} ₽</span>
                                </>
                            ) : (
                                <span className="font-bold">{Math.round(product.price)} ₽</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input
                            id="name"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (для чека и восстановления)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@mail.ru"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Промокод</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="PROMO"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                disabled={!!appliedPromo}
                            />
                            {appliedPromo ? (
                                <Button variant="outline" onClick={() => {
                                    setAppliedPromo(null);
                                    setPromoCode('');
                                }}>
                                    ✕
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={handleApplyPromo}
                                    disabled={!promoCode || isCheckingPromo}
                                >
                                    {isCheckingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Применить'}
                                </Button>
                            )}
                        </div>
                        {promoError && <p className="text-xs text-red-500">{promoError}</p>}
                        {appliedPromo && <p className="text-xs text-green-600">Промокод применен! Скидка {appliedPromo.discount} ₽</p>}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handlePay}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Перейти к оплате {Math.round(finalPrice)} ₽
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
