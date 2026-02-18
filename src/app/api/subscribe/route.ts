import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

// POST /api/subscribe — Subscribe to daily motivations
export async function POST(request: Request) {
    try {
        const supabase = createPublicClient();
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

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('subscribers')
            .select('id, is_active')
            .eq('email', email.trim().toLowerCase())
            .single();

        if (existing) {
            if (existing.is_active) {
                return NextResponse.json(
                    { message: 'You\'re already subscribed! Look out for your daily motivation.' },
                    { status: 200 }
                );
            } else {
                // Reactivate
                await supabase
                    .from('subscribers')
                    .update({ is_active: true })
                    .eq('id', existing.id);

                return NextResponse.json(
                    { message: 'Welcome back! Your subscription has been reactivated.' },
                    { status: 200 }
                );
            }
        }

        // Insert new subscriber
        const { error } = await supabase
            .from('subscribers')
            .insert({
                email: email.trim().toLowerCase(),
                is_active: true,
                confirmed: true,
            });

        if (error) throw error;

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
