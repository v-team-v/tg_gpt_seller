"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    totalCount: number;
    pageSize?: number;
}

export function PaginationControls({
    totalCount,
    pageSize = 50,
}: PaginationControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const totalPages = Math.ceil(totalCount / pageSize);

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                Показано {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, totalCount)} из {totalCount}
            </div>
            <div className="space-x-2 flex items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(createPageURL(page - 1))}
                    disabled={page <= 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Назад
                </Button>
                <div className="text-sm font-medium">
                    Страница {page} из {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(createPageURL(page + 1))}
                    disabled={page >= totalPages}
                >
                    Вперед
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
