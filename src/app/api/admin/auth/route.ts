import { NextResponse } from 'next/server';

// POST /api/admin/auth — Simple admin login
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        if (password === process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ authenticated: true, token: password });
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
