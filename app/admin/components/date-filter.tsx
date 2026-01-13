'use client';

import { Input } from '@/components/ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function DateFilter({ placeholder = 'Выберите дату' }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleDateChange = (date: string) => {
        const params = new URLSearchParams(searchParams);
        if (date) {
            params.set('date', date);
        } else {
            params.delete('date');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-shrink-0">
            <Input
                type="date"
                className="w-full max-w-[180px]"
                onChange={(e) => handleDateChange(e.target.value)}
                defaultValue={searchParams.get('date')?.toString()}
                placeholder={placeholder}
            />
        </div>
    );
}
