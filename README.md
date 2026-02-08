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

# 🎉 Clinic Medical Management System

**Repository**: https://github.com/Jasonng5588/Clinic-Medical-Management-System

## 🚀 项目概览

完整的诊所管理系统，包含以下功能模块：

### ✅ 核心功能
- **患者管理** - 完整的CRUD操作，患者档案，病历
- **预约管理** - 预约调度，日历视图，状态管理
- **咨询管理** - SOAP notes，诊断，处方
- **队列管理** - 实时队列，语音通知，优先级管理
- **处方管理** - 药物处方，剂量，疗程
- **发票管理** - 计费，付款，退款流程
- **库存管理** - 药品库存，低库存警告，过期追踪
- **员工管理** - 员工档案，排班，请假管理
- **报告分析** - 财务报告，患者报告，预约报告（含CSV导出）

### 🎨 技术栈
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI功能**: AI诊断建议（OpenAI API）
- **实时功能**: Queue management with real-time updates

---

## 🔧 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/Jasonng5588/Clinic-Medical-Management-System.git
cd Clinic-Medical-Management-System
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. 数据库设置
在Supabase SQL Editor中运行：
- `scripts/emergency-fix-v2.sql` ⚠️ **必须运行**

### 5. 运行开发服务器
```bash
npm run dev
```
访问: http://localhost:3000

---

## 📁 项目结构

```
├── app/                     # Next.js App Router
│   ├── (auth)/             # 登录/注册
│   └── (dashboard)/        # 主要功能模块
├── components/             # React组件
├── lib/                    # 工具函数
├── scripts/                # 数据库SQL脚本
├── store/                  # 状态管理
└── types/                  # TypeScript类型
```

---

## 🎯 关键功能

- 🏥 **队列管理** - 实时更新，语音通知，优先级支持
- 📊 **报告系统** - CSV导出，统计分析
- 🤖 **AI诊断** - GPT-4集成，症状分析
- 👥 **多角色** - Super Admin, Doctor, Nurse, Receptionist, Accountant

---

## 📧 联系

**作者**: Jason Ng  
**Email**: michaelng5588@gmail.com  
**GitHub**: https://github.com/Jasonng5588

---

**最后更新**: 2026年2月8日
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
