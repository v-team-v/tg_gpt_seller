'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { WebCheckoutModal } from './WebCheckoutModal';

interface ProductCardProps {
    product: {
        id: number;
        title: string;
        price: number;
        description: string;
    };
    enrichedDescription?: string;
    features?: string[];
}

export function ProductCardClient({ product, enrichedDescription, features }: ProductCardProps) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const description = enrichedDescription || product.description;
    const items = features || product.description.split('\n');

    // Create a product object that matches what modals expect
    const modalProduct = {
        ...product,
        description,
        features: items
    };

    return (
        <>
            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{Math.round(product.price)} ₽</span>
                    </div>
                </div>

                <div className="flex-grow mb-8">
                    <p className="text-muted-foreground mb-6 min-h-[80px]">
                        {description}
                    </p>

                    <ul className="space-y-3">
                        {items.map((line, i) => (
                            line.trim() && (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>{line.trim().replace(/^[-•*]\s*/, '')}</span>
                                </li>
                            )
                        ))}
                    </ul>
                </div>

                <Button
                    onClick={() => setIsDetailOpen(true)}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-opacity"
                >
                    Выбрать
                </Button>
            </div>

            <ProductDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                product={modalProduct}
                onSelect={() => {
                    setIsDetailOpen(false);
                    setIsCheckoutOpen(true);
                }}
            />

            <WebCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                product={product}
            />
        </>
    );
}
