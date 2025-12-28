'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track page views when pathname/searchParams change
        if (typeof window !== 'undefined' && (window as any).ym) {
            (window as any).ym(106059751, 'hit', window.location.href);
        }
    }, [pathname, searchParams]);

    return (
        <>
            <Script
                id="yandex-metrika"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(106059751, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
            });
          `,
                }}
            />
            <noscript>
                <div>
                    <img src="https://mc.yandex.ru/watch/106059751" style={{ position: 'absolute', left: '-9999px' }} alt="" />
                </div>
            </noscript>
        </>
    );
}
