import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

// GET /api/motivations — Get a random approved motivation
export async function GET() {
    try {
        const supabase = createPublicClient();

        // Get count of approved motivations
        const { count, error: countError } = await supabase
            .from('motivations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');

        if (countError) throw countError;

        if (!count || count === 0) {
            return NextResponse.json(
                { motivation: null, message: 'No motivations available yet.' },
                { status: 200 }
            );
        }

        // Get a random offset
        const randomOffset = Math.floor(Math.random() * count);

        const { data, error } = await supabase
            .from('motivations')
            .select('id, text, author, is_anonymous')
            .eq('status', 'approved')
            .range(randomOffset, randomOffset)
            .single();

        if (error) throw error;

        return NextResponse.json({
            motivation: {
                id: data.id,
                text: data.text,
                author: data.is_anonymous ? null : data.author,
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

// POST /api/motivations — Submit a new motivation
export async function POST(request: Request) {
    try {
        const supabase = createPublicClient();
        const body = await request.json();
        const { text, author, is_anonymous } = body;

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

        const { data, error } = await supabase
            .from('motivations')
            .insert({
                text: text.trim(),
                author: is_anonymous ? null : (author?.trim() || null),
                is_anonymous: !!is_anonymous,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(
            { message: 'Your motivation has been submitted for review. Thank you!', id: data.id },
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
