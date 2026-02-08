# 🚀 Vercel部署配置 - 环境变量

## 📋 在Vercel中添加这些环境变量

在Vercel部署页面的 **Environment Variables** 部分，添加以下变量：

---

### ✅ 必需的环境变量（直接复制粘贴）

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zsgfauenaxgpjgsthhef.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZ2ZhdWVuYXhncGpnc3RoaGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjgzODcsImV4cCI6MjA4NTQ0NDM4N30.Il9O7ftHzQ1-Ml4zSZe3nq6ko_tZkDUqcElvukSXijo` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` |

---

## 📝 逐个添加步骤：

### 变量 1:
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://zsgfauenaxgpjgsthhef.supabase.co`
- 点击 **Add**

### 变量 2:
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZ2ZhdWVuYXhncGpnc3RoaGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjgzODcsImV4cCI6MjA4NTQ0NDM4N30.Il9O7ftHzQ1-Ml4zSZe3nq6ko_tZkDUqcElvukSXijo`
- 点击 **Add**

### 变量 3:
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: ⚠️ **部署后更新**
  - 第一次部署时可以先填: `https://clinic-medical-management-system.vercel.app`
  - 部署完成后，Vercel会给你实际的URL，再回到Settings更新这个值

---

## ⚙️ 可选的环境变量

如果你有这些服务，也可以添加：

### OpenAI (AI诊断功能):
- **Key**: `OPENAI_API_KEY`
- **Value**: `你的OpenAI API key`

### Stripe (支付功能):
- **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `你的Stripe公钥`

### Email (通知功能):
- **Key**: `SMTP_HOST`
- **Value**: `你的SMTP服务器`

---

## 🎯 快速操作清单：

1. ✅ 在Vercel页面点击 **Environment Variables**
2. ✅ 添加 `NEXT_PUBLIC_SUPABASE_URL`
3. ✅ 添加 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. ✅ 添加 `NEXT_PUBLIC_APP_URL` (先用临时URL)
5. ✅ 点击 **Deploy** 按钮
6. ⏳ 等待2-3分钟部署完成
7. ✅ 获取实际URL后，到 Settings → Environment Variables 更新 `NEXT_PUBLIC_APP_URL`
8. ✅ 重新部署

---

## 🔥 部署后必做事项：

### 1. 更新Supabase Allowed URLs
登录Supabase → Settings → Authentication → URL Configuration
添加你的Vercel URL：
- Site URL: `https://your-app-name.vercel.app`
- Redirect URLs: `https://your-app-name.vercel.app/**`

### 2. 测试登录
用你的账号登录测试！

---

**现在就可以点击Deploy了！** 🚀
