export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';


export async function GET() {
    try {
        const session = await requireAuth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const db = await getDb();
        const [pixelRow, teraboxRow] = await Promise.all([
            db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['pixel_id'] }),
            db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['terabox_link'] })
        ]);

        return NextResponse.json({
            pixel_id: pixelRow.rows.length > 0 ? pixelRow.rows[0].value : '',
            terabox_link: teraboxRow.rows.length > 0 ? teraboxRow.rows[0].value : '',
        });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { pixel_id, terabox_link, new_password } = await request.json();
        const db = await getDb();

        // Update Pixel ID if provided
        if (pixel_id !== undefined) {
            await db.execute({
                sql: `
                    INSERT INTO settings (key, value) VALUES ('pixel_id', ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value
                `,
                args: [pixel_id]
            });
        }

        // Update Terabox Link if provided
        if (terabox_link !== undefined) {
            await db.execute({
                sql: `
                    INSERT INTO settings (key, value) VALUES ('terabox_link', ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value
                `,
                args: [terabox_link]
            });
        }

        // Update Password if provided
        if (new_password) {
            // Use Web Crypto API instead of bcryptjs for Edge compatibility
            const encoder = new TextEncoder();
            const data = encoder.encode(new_password);

            // Edge & Node 18+ standard Web Crypto API
            const subtleCrypto = globalThis.crypto.subtle;

            const hashBuffer = await subtleCrypto.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            await db.execute({
                sql: `
                    INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value
                `,
                args: [hashHex]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Settings POST error:', error);
        return NextResponse.json({ error: `Server Error: ${error?.message || String(error)}` }, { status: 500 });
    }
}
