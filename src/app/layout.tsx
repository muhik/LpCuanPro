import type { Metadata } from 'next'
import './globals.css'
import { getDb } from '@/lib/db'
import Script from 'next/script'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-jakarta',
})

export const metadata: Metadata = {
    title: 'E-Book Premium - 14.000+ Worksheet Anak',
    description: 'Dapatkan ribuan worksheet edukatif untuk anak dengan harga spesial.',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let pixelId = '';
    try {
        const db = await getDb();
        const row = await db.execute({
            sql: 'SELECT value FROM settings WHERE key = ?',
            args: ['pixel_id']
        });
        if (row.rows.length > 0) {
            pixelId = row.rows[0].value as string;
        }
    } catch (e) {
        console.error("Failed to load pixel ID", e);
    }

    return (
        <html lang="id" className={`${outfit.variable} ${jakarta.variable}`}>
            <body className="font-outfit antialiased" suppressHydrationWarning>
                {pixelId ? (
                    <Script
                        id="fb-pixel"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                !function(f,b,e,v,n,t,s)
                                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                                n.queue=[];t=b.createElement(e);t.async=!0;
                                t.src=v;s=b.getElementsByTagName(e)[0];
                                s.parentNode.insertBefore(t,s)}(window, document,'script',
                                'https://connect.facebook.net/en_US/fbevents.js');
                                fbq('init', '${pixelId}');
                                fbq('track', 'PageView');
                            `,
                        }}
                    />
                ) : null}
                {children}
            </body>
        </html>
    )
}
