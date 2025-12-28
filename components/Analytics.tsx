'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (function (m: any, e: any, t: string, r: string, i: string, k?: any, a?: any) {
            m[i] = m[i] || function () {
                // eslint-disable-next-line prefer-rest-params
                (m[i].a = m[i].a || []).push(arguments)
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            m[i].l = 1 * (new Date() as any);
            for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
            k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
        })
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).ym(106059751, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
        });
    }, [pathname, searchParams]);

    return (
        <noscript>
            <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://mc.yandex.ru/watch/106059751" style={{ position: 'absolute', left: '-9999px' }} alt="" />
            </div>
        </noscript>
    );
}
