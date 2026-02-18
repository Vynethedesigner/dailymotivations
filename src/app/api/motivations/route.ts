import { NextResponse } from 'next/server';

const DUMMY_MOTIVATIONS = [
    { id: '1', text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { id: '2', text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { id: '3', text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { id: '4', text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { id: '5', text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { id: '6', text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { id: '7', text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { id: '8', text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { id: '9', text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
    { id: '10', text: "You define your own life. Don't let other people write your script.", author: "Oprah Winfrey" }
];

// GET /api/motivations — Get a random motivation (DUMMY MODE)
export async function GET() {
    try {
        // Pick a random motivation from our dummy list
        const randomIndex = Math.floor(Math.random() * DUMMY_MOTIVATIONS.length);
        const motivation = DUMMY_MOTIVATIONS[randomIndex];

        return NextResponse.json({
            motivation: {
                id: motivation.id,
                text: motivation.text,
                author: motivation.author,
            },
        });
    } catch (error) {
        console.error('Error fetching motivation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch motivation' },
            { status: 500 }
        );
    }
}

// POST /api/motivations — Simulate submitting a new motivation
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        // Validation
        if (!text || typeof text !== 'string' || text.trim().length < 5) {
            return NextResponse.json(
                { error: 'Motivation text must be at least 5 characters.' },
                { status: 400 }
            );
        }

        if (text.trim().length > 500) {
            return NextResponse.json(
                { error: 'Motivation text must be under 500 characters.' },
                { status: 400 }
            );
        }

        // Simulate a successful submission
        // In a real app, we would insert into Supabase here.

        return NextResponse.json(
            { message: 'Your motivation has been submitted for review. Thank you!', id: 'dummy-id-' + Date.now() },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error submitting motivation:', error);
        return NextResponse.json(
            { error: 'Failed to submit motivation' },
            { status: 500 }
        );
    }
}
