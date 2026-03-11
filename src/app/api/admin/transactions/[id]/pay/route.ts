import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAuth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        const db = await getDb();

        await db.execute({
            sql: 'UPDATE transactions SET status = ? WHERE id = ?',
            args: ['PAID', parseInt(id)]
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
