import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'edge';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

        if (!isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
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
