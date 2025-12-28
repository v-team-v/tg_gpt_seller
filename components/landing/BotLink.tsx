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
        let attempts = 0;
        const maxAttempts = 5; // Try for 2.5 seconds max

        const getClientId = () => {
            // @ts-ignore
            if (window.ym) {
                try {
                    // @ts-ignore
                    window.ym(99122777, 'getClientID', (clientID) => {
                        if (clientID) {
                            setHref(`${baseHref}?start=${clientID}`);
                        }
                    });
                } catch (e) {
                    console.error("Yandex Metrika error:", e);
                }
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(getClientId, 500);
            }
        };

        // Start checking (non-blocking)
        setTimeout(getClientId, 100);
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
