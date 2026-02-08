# Clinic Medical Management SaaS

A complete production-grade medical management SaaS system for dental clinics, medical clinics, aesthetic centers, physiotherapy centers, and small hospitals.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Tables**: Tanstack Table
- **Payments**: Stripe
- **PDF Generation**: jsPDF

## Features

### Core Modules
- ✅ Authentication & Authorization (RBAC)
- ✅ Role-based Dashboard (Super Admin, Doctor, Nurse, Receptionist, Accountant)
- ✅ Patient Management
- ✅ Appointment Scheduling with Calendar
- ✅ Real-time Queue Management
- ✅ Consultation Records
- ✅ Prescription Management
- ✅ Medicine Inventory with Auto-deduction
- ✅ Billing & Invoicing
- ✅ Payment Processing (Cash, Card, Stripe)
- ✅ Staff Management
- ✅ Reports & Analytics
- ✅ Settings & Configuration
- ✅ Real-time Notifications

### UI/UX Features
- ✅ Dark Mode Support
- ✅ Fully Responsive Design
- ✅ Loading States & Skeletons
- ✅ Empty States
- ✅ Error Handling
- ✅ Toast Notifications
- ✅ Professional Medical Theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone and Install**

```bash
cd "c:\\Clinic  Medical Management System"
npm install
```

2. **Environment Setup**

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zsgfauenaxgpjgsthhef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZ2ZhdWVuYXhncGpnc3RoaGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjgzODcsImV4cCI6MjA4NTQ0NDM4N30.Il9O7ftHzQ1-Ml4zSZe3nq6ko_tZkDUqcElvukSXijo

# Database (replace [YOUR-PASSWORD])
DATABASE_URL=postgresql://postgres.zsgfauenaxgpjgsthhef:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.zsgfauenaxgpjgsthhef:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Stripe (get from stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Database Setup**

Run migrations in Supabase Dashboard SQL Editor:

```bash
# Execute each file in order:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_rls_policies.sql
3. supabase/migrations/003_functions.sql
4. supabase/seed.sql (for demo data)
```

Or use Supabase CLI:

```bash
supabase login
supabase link --project-ref zsgfauenaxgpjgsthhef
supabase db push
```

4. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

20+ tables with full relationships:
- `staff_profiles` - Staff members with roles
- `patients` - Patient master data
- `appointments` - Scheduling
- `queues` - Real-time queue
- `consultations` - Medical records
- `prescriptions` & `prescription_items` - Medication
- `medicines` - Inventory
- `inventory_transactions` - Stock tracking
- `invoices` & `invoice_items` - Billing
- `payments` - Payment records
- `services` - Available services
- `rooms` - Facility rooms
- `expenses` - Operational costs
- `notifications` - User notifications
- `settings` - Configuration

## User Roles

- **Super Admin**: Full system access
- **Doctor**: Consultations, prescriptions, view patients
- **Nurse**: Patient care, queue management, inventory
- **Receptionist**: Appointments, patient registration, queue
- **Accountant**: Billing, payments, financial reports

## Default Login (After Seeding)

Create staff accounts via Supabase Auth Dashboard or registration page.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── [feature]/         # Feature-specific components
├── lib/                   # Utilities
│   ├── supabase/          # Supabase clients
│   ├── pdf/               # PDF generators
│   ├── validations/       # Zod schemas
│   └── utils.ts           # Helper functions
├── store/                 # Zustand stores
├── types/                 # TypeScript types
├── supabase/             # Database files
│   ├── migrations/        # SQL migrations
│   └── seed.sql           # Seed data
└── scripts/              # Utility scripts
```

## Key Features Explained

### Real-time Queue
- Supabase Realtime subscriptions
- Live updates across multiple screens
- Priority queue support

### Auto Inventory Deduction
- Database triggers
- Automatic stock updates on prescription
- Low stock alerts

### Invoice & Payment
- Multi-item invoicing
- Tax & discount calculations
- Stripe integration
- PDF generation

### Role-based Access
- Row Level Security (RLS)
- Frontend route protection
- Feature-level permissions

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Set all `.env.local` variables in Vercel
- Update `NEXT_PUBLIC_APP_URL` to production URL
- Use production Stripe keys

## Support & Documentation

For issues or questions:
1. Check Supabase logs
2. Review RLS policies
3. Check browser console for errors

## License

Proprietary - All rights reserved

## Credits

Built with ❤️ using Next.js 14, Supabase, and shadcn/ui
