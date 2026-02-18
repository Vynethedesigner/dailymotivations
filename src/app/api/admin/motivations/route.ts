import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Simple admin auth check
function verifyAdmin(request: Request): boolean {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;
    const token = authHeader.replace('Bearer ', '');
    return token === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/motivations — Get all motivations (paginated, filterable)
export async function GET(request: Request) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const supabase = createServiceClient();
        let query = supabase
            .from('motivations')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, count, error } = await query;
        if (error) throw error;

        return NextResponse.json({
            motivations: data,
            total: count,
            page,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (error) {
        console.error('Admin: Error fetching motivations:', error);
        return NextResponse.json({ error: 'Failed to fetch motivations' }, { status: 500 });
    }
}

// PATCH /api/admin/motivations — Update motivation (approve/reject/edit)
export async function PATCH(request: Request) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, status, text, author } = body;

        if (!id) {
            return NextResponse.json({ error: 'Motivation ID is required' }, { status: 400 });
        }

        const supabase = createServiceClient();
        const updateData: Record<string, string> = {};
        if (status) updateData.status = status;
        if (text !== undefined) updateData.text = text;
        if (author !== undefined) updateData.author = author;

        const { data, error } = await supabase
            .from('motivations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ motivation: data });
    } catch (error) {
        console.error('Admin: Error updating motivation:', error);
        return NextResponse.json({ error: 'Failed to update motivation' }, { status: 500 });
    }
}

// DELETE /api/admin/motivations — Delete motivation
export async function DELETE(request: Request) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Motivation ID is required' }, { status: 400 });
        }

        const supabase = createServiceClient();
        const { error } = await supabase
            .from('motivations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Motivation deleted' });
    } catch (error) {
        console.error('Admin: Error deleting motivation:', error);
        return NextResponse.json({ error: 'Failed to delete motivation' }, { status: 500 });
    }
}
