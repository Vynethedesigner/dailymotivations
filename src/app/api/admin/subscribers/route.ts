import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

function verifyAdmin(request: Request): boolean {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;
    const token = authHeader.replace('Bearer ', '');
    return token === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/subscribers — Get all subscribers
export async function GET(request: Request) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format');

        const supabase = createServiceClient();
        const { data, count, error } = await supabase
            .from('subscribers')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (error) throw error;

        // CSV export
        if (format === 'csv') {
            const csv = [
                'Email,Status,Confirmed,Subscribed Date',
                ...(data || []).map((s: { email: string; is_active: boolean; confirmed: boolean; created_at: string }) =>
                    `${s.email},${s.is_active ? 'Active' : 'Inactive'},${s.confirmed ? 'Yes' : 'No'},${new Date(s.created_at).toISOString()}`
                ),
            ].join('\n');

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename=subscribers.csv',
                },
            });
        }

        return NextResponse.json({
            subscribers: data,
            total: count,
        });
    } catch (error) {
        console.error('Admin: Error fetching subscribers:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
}
