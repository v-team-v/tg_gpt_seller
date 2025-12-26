'use client';

import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { toggleProductStatus } from '@/app/actions/products';
import { useTransition } from 'react';

export function ToggleProductButton({ id, isActive }: { id: number, isActive: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleProductStatus(id);
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={isPending}
            title={isActive ? "Скрыть" : "Показать"}
            className={isActive ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"}
        >
            {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
    );
}
