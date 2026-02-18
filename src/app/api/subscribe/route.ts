import { NextResponse } from 'next/server';

// POST /api/subscribe — Subscribe to daily motivations (DUMMY MODE)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validation
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required.' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        // Simulate success
        return NextResponse.json(
            { message: 'You\'re subscribed! You\'ll receive a daily motivation in your inbox.' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error subscribing:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again.' },
            { status: 500 }
        );
    }
}
