'use client';

import { useState } from 'react';
import { deletePromoCode } from './actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

export function DeletePromoButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить этот промокод?')) return;

        setIsDeleting(true);
        const result = await deletePromoCode(id);
        setIsDeleting(false);

        if (!result.success) {
            alert('Ошибка при удалении');
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
