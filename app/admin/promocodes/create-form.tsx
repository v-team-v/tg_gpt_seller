'use client';

import { useState } from 'react';
import { createPromoCode } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function CreatePromoForm() {
    const [amount, setAmount] = useState('200');
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createPromoCode(Number(amount), comment);

        setIsLoading(false);
        if (result.success) {
            setComment('');
            alert('Промокод успешно создан');
        } else {
            alert('Ошибка при создании промокода');
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Сумма скидки (₽)</label>
                        <Input
                            type="number"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-32"
                        />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <label className="text-sm font-medium leading-none">Комментарий (необязательно)</label>
                        <Input
                            placeholder="Например: За позитивный отзыв"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Сгенерировать код
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
