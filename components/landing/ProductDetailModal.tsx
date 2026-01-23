'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        title: string;
        description: string;
        price: number;
        features?: string[];
    };
    onSelect: () => void;
}

export function ProductDetailModal({ isOpen, onClose, product, onSelect }: ProductDetailModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{product.title}</DialogTitle>
                </DialogHeader>

                <div className="py-3">
                    <p className="text-muted-foreground mb-4">
                        {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                        <div className="bg-muted/30 p-3 rounded-xl space-y-2 mb-4">
                            {product.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>{feature}</span>
                                </div>
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
                </div>

                <DialogFooter className="gap-4 sm:gap-4 mt-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Отмена
                    </Button>
                    <Button onClick={() => {
                        // @ts-ignore
                        if (typeof window !== 'undefined' && window.ym) {
                            // @ts-ignore
                            window.ym(106059751, 'reachGoal', 'begin_checkout_site');
                        }
                        onSelect();
                    }} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                        Выбрать этот товар
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
