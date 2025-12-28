"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BotLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    baseHref?: string;
    children: React.ReactNode;
}

export function BotLink({ className, baseHref = "https://t.me/gpt_sub_bot", children, ...props }: BotLinkProps) {
    const [href, setHref] = useState(baseHref);

    useEffect(() => {
        // Yandex Metrika polling disabled to fix Safari blocking
    }, [baseHref]);

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("", className)}
            {...props}
        >
            {children}
        </a>
    );
}
