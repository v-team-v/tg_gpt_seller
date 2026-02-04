'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BuyProductModal } from './BuyProductModal';
import { Check } from 'lucide-react';
import { ProductData } from '../data';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    type: string;
    imageUrl: string | null;
}

interface BuyProductCardProps {
    product: Product;
    productData?: ProductData;
}

export function BuyProductCard({ product, productData }: BuyProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const title = productData?.displayTitle || product.title;
    const description = productData?.description || product.description;
    const items = productData?.features || product.description.split('\n');

    return (
        <>
            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden group h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2 min-h-[56px] flex items-center">{title}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{Math.round(product.price)} ₽</span>
                    </div>
                </div>

                <div className="flex-grow mb-8">
                    <p className="text-muted-foreground mb-6 min-h-[80px] whitespace-pre-wrap text-sm">
                        {description}
                    </p>

                    <ul className="space-y-3">
                        {items.map((line, i) => (
                            line.trim() && (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>{line.trim().replace(/^[-•*]\s*/, '')}</span>
                                </li>
                            )
                        ))}
                    </ul>
                </div>

                <Button
                    onClick={() => {
                        // @ts-ignore
                        if (typeof window !== 'undefined' && window.ym) {
                            // @ts-ignore
                            window.ym(106059751, 'reachGoal', 'view_product_site');
                        }
                        setIsModalOpen(true);
                    }}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-opacity mt-auto"
                >
                    Выбрать
                </Button>
            </div>

            <BuyProductModal
                product={product}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                productData={productData}
            />
        </>
    );
}
