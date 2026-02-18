export interface Motivation {
    id: string;
    text: string;
    author: string | null;
    is_anonymous: boolean;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface Subscriber {
    id: string;
    email: string;
    is_active: boolean;
    confirmed: boolean;
    confirmation_token: string | null;
    created_at: string;
}

export interface SubmitMotivationPayload {
    text: string;
    author?: string;
    is_anonymous: boolean;
}

export interface SubscribePayload {
    email: string;
}
