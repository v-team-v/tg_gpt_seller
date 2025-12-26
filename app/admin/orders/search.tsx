'use client';

import { Input } from '@/components/ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function Search({ placeholder, queryKey = 'q' }: { placeholder: string; queryKey?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set(queryKey, term);
        } else {
            params.delete(queryKey);
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="relative flex flex-1 flex-shrink-0">
            <Input
                className="w-full max-w-sm"
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get(queryKey)?.toString()}
            />
        </div>
    );
}
