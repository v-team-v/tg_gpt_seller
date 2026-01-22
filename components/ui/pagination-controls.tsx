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

    // Sliding window logic: show current +/- 2 pages
    const windowSize = 2;
    let startPage = Math.max(1, page - windowSize);
    let endPage = Math.min(totalPages, page + windowSize);

    // If we are at the start, try to show more future pages to keep total constant (5)
    // if (startPage === 1) { endPage = Math.min(totalPages, 5); }
    // If we are at the end, try to show more past pages 
    // if (endPage === totalPages) { startPage = Math.max(1, totalPages - 4); }
    // User asked "current +/- 2", implying variable width is fine or symmetric.
    // "при клике на лист, он будет показывать следующие 2 и прошлые 2"
    // So if page 5: 3,4,5,6,7. If page 1: 1,2,3. If page 10 (last): 8,9,10.
    // My logic above does exactly this.

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Показано {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, totalCount)} из {totalCount}
            </div>

            <div className="flex items-center gap-1 order-1 sm:order-2 bg-white rounded-md border p-1 border-border shadow-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(createPageURL(page - 1))}
                    disabled={page <= 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {pages.map((p) => (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => router.push(createPageURL(p))}
                        className={`h-8 w-8 p-0 ${p === page ? "pointer-events-none" : ""}`}
                    >
                        {p}
                    </Button>
                ))}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(createPageURL(page + 1))}
                    disabled={page >= totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
