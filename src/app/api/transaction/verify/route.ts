export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const idParam = searchParams.get('id');

        if (!email && !idParam) {
            return NextResponse.json({ error: 'Missing email or id' }, { status: 400 });
        }

        const db = await getDb();
        let tx: any = null;

        if (idParam) {
            const result = await db.execute({
                sql: 'SELECT id, status, email, name, amount, mayar_id FROM transactions WHERE id = ?',
                args: [parseInt(idParam, 10)]
            });
            tx = result.rows[0];
        } else if (email) {
            const result = await db.execute({
                sql: 'SELECT id, status, email, name, amount, mayar_id FROM transactions WHERE email = ? ORDER BY id DESC LIMIT 1',
                args: [email]
            });
            tx = result.rows[0];
        }

        if (!tx) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Validate that the email matches the transaction (Security layer)
        if (email && tx.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- THE "CRON JOB" POLLING FALLBACK ---
        // If our local database still says PENDING, let's double check with Mayar directly
        if (tx.status === 'PENDING' && tx.mayar_id) {
            try {
                const mayarResponse = await fetch(`https://api.mayar.id/hl/v1/invoice/${tx.mayar_id}`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.MAYAR_API_KEY}`
                    }
                });

                if (mayarResponse.ok) {
                    const mayarData = await mayarResponse.json();
                    const currentMayarStatus = mayarData?.data?.status;

                    if (currentMayarStatus === 'PAID' || currentMayarStatus === 'SETTLED' || currentMayarStatus === 'paid' || currentMayarStatus === 'SUCCESS') {
                        // Webhook missed it! Let's update our database manually
                        await db.execute({
                            sql: `UPDATE transactions SET status = 'PAID' WHERE id = ?`,
                            args: [tx.id]
                        });
                        console.log(`Polling fallback detected PAID status for transaction ${tx.id}, manually updated.`);
                        tx.status = 'PAID';
                    }
                }
            } catch (pollErr) {
                console.error('Failed to poll Mayar for status:', pollErr);
                // Ignore error and fall through to return our local 'PENDING' status
            }
        }

        // --- FETCH TERABOX LINK FROM SETTINGS ---
        let teraboxLink = '';
        try {
            const result = await db.execute({
                sql: 'SELECT value FROM settings WHERE key = ?',
                args: ['terabox_link']
            });
            if (result.rows.length > 0) {
                teraboxLink = result.rows[0].value as string;
            }
        } catch (settingsErr) {
            console.error('Failed to fetch terabox link:', settingsErr);
        }

        // Attach the terabox link to the transaction object
        tx.terabox_link = teraboxLink;

        return NextResponse.json({ transaction: tx });

    } catch (error) {
        console.error('Error fetching transaction status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
