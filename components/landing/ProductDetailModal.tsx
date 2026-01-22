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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{product.title}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-muted-foreground mb-6">
                        {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                        <div className="bg-muted/30 p-4 rounded-xl space-y-3 mb-6">
                            {product.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-muted-foreground">Стоимость:</span>
                        <span className="text-2xl font-bold">{Math.round(product.price)} ₽</span>
                    </div>
                </div>

                <DialogFooter className="gap-4 sm:gap-4 mt-6">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Отмена
                    </Button>
                    <Button onClick={onSelect} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                        Выбрать этот товар
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
