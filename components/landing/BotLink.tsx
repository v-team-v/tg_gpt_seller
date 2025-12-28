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
        const interval = setInterval(() => {
            // @ts-ignore
            if (window.ym) {
                // @ts-ignore
                window.ym(106059751, 'getClientID', (clientID) => {
                    if (clientID) {
                        setHref(`${baseHref}?start=ym_${clientID}`);
                        clearInterval(interval);
                    }
                });
            }
        }, 500);

        return () => clearInterval(interval);
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
