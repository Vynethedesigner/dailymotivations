# Daily Motivations ✦

> *"One message. That's all you need today."*

A clean, distraction-free website that displays one motivational message at a time. No feeds, no noise — just one powerful message.

---

## ✨ Features

- **One Motivation at a Time** — Clean, centered display with beautiful typography
- **Refresh** — Load a new random approved motivation
- **Submit** — Users can submit their own motivations (requires admin approval)
- **Share as Image** — Generate a downloadable branded image for social media
- **Email Subscription** — Subscribe to receive daily motivations via email
- **Admin Panel** — Password-protected dashboard to manage motivations and subscribers

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Styling | Vanilla CSS (CSS Modules) |
| Email | Resend |
| Image Gen | html-to-image |
| Fonts | Playfair Display + Inter |

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Resend](https://resend.com) account (for email, optional for MVP)

### 2. Clone & Install

```bash
cd daily-motivations
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema file: `supabase-schema.sql`
   - This creates the `motivations` and `subscribers` tables
   - Sets up Row Level Security policies
   - Seeds 15 starter motivations
3. Copy your Supabase credentials

### 4. Configure Environment

Edit `.env.local` with your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin
ADMIN_PASSWORD=choose_a_strong_password

# Resend (optional for MVP)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=motivations@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Daily Motivations
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── motivations/route.ts    # GET random, POST submit
│   │   ├── subscribe/route.ts      # POST subscribe
│   │   ├── unsubscribe/route.ts    # GET unsubscribe
│   │   └── admin/
│   │       ├── auth/route.ts       # POST admin login
│   │       ├── motivations/route.ts # GET/PATCH/DELETE admin ops
│   │       └── subscribers/route.ts # GET subscribers + CSV export
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   └── admin.module.css
│   ├── globals.css                 # Design system
│   ├── layout.tsx                  # Root layout + SEO
│   ├── page.tsx                    # Homepage
│   └── page.module.css
├── lib/
│   ├── supabase.ts                 # Supabase client factory
│   └── types.ts                    # TypeScript interfaces
└── supabase-schema.sql             # Database schema + seed data
```

---

## 🔐 Admin Panel

Access via `/admin` or the footer link.

**Features:**
- View all motivations (pending/approved/rejected)
- Approve, reject, edit, or delete motivations
- View subscriber list
- Export subscriber emails as CSV
- Stats dashboard

---

## 📧 Email Setup (Optional)

The email subscription endpoint is ready. To send daily emails:

1. Set up a [Resend](https://resend.com) account
2. Add your API key to `.env.local`
3. Create a Supabase Edge Function or a cron job that:
   - Fetches a random approved motivation
   - Sends it to all active subscribers via Resend

---

## 🎨 Design Philosophy

The design is intentionally minimal:
- Dark background with warm peach/amber accent (#e8a87c)
- Playfair Display for motivational text (serif = timeless)
- Inter for UI elements (clean, modern)
- Subtle ambient gradient and hover micro-animations
- Full responsive (mobile-first)

---

## 📄 License

MIT
