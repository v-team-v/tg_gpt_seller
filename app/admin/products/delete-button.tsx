'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/actions/products';
import { useTransition } from 'react';

export function DeleteProductButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            startTransition(async () => {
                const result = await deleteProduct(id);
                if (!result.success && result.error) {
                    alert(result.error);
                }
            });
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
