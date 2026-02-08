# 🚨 紧急修复指南 (Emergency Fix Guide)

## 问题总结 (Problems Summary)

你遇到的所有bug都是由于**数据库schema和RLS策略问题**导致的:

1. ❌ **Staff role更新失败** - RLS策略阻止更新
2. ❌ **Queue添加失败** - `priority_level`字段类型错误 (是INTEGER不是TEXT)
3. ❌ **Consultation创建失败** - 缺少required字段 `consultation_number`
4. ❌ **Invoice创建可能失败** - RLS策略问题

## 🎯 解决方案 (Solutions)

### **第一步: 必须立即执行SQL (CRITICAL!)**

在 **Supabase SQL Editor** 中运行这个SQL文件:

**文件**: `scripts/emergency-fix.sql`

这个SQL会:
- ✅ 修复RLS策略允许更新staff_profiles
- ✅ 将`queues.priority_level`从TEXT改为INTEGER  
- ✅ 添加`consultations.consultation_number`字段
- ✅ 临时关闭RLS (仅用于开发环境)
- ✅ 授予必要的权限

### **第二步: 代码已经修复 (Already Fixed)**

我已经修改了以下文件:

1. **`app/(dashboard)/queue/add/page.tsx`**
   - ✅ Priority现在发送整数 (1/2/3) 而不是字符串
   - ✅ 字段名改为`priority_level`
   
2. **`app/(dashboard)/consultations/new/page.tsx`**
   - ✅ 添加了`consultation_number`生成
   - ✅ Format: `CON1234567890`

3. **`components/staff/edit-staff-modal.tsx`**
   - ✅ 添加了super_admin选项 (之前已修复)

---

## 📋 执行步骤 (Step by Step)

### 1. 打开Supabase
访问你的Supabase项目: https://supabase.com

### 2. 进入SQL Editor
左侧菜单 → **SQL Editor** → **New Query**

### 3. 复制并执行SQL
打开文件: `c:\Clinic  Medical Management System\scripts\emergency-fix.sql`

全选内容，粘贴到SQL Editor，点击 **RUN**

### 4. 重启开发服务器
服务器已经在运行，只需刷新浏览器: **Ctrl + F5**

### 5. 测试所有功能

---

## ✅ 测试清单 (Testing Checklist)

运行SQL后，测试这些功能:

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| **更新Staff Role** | `/staff` → 编辑员工 → 改role → 保存 | ✅ 成功保存，无错误 |
| **添加到Queue** | `/queue/add` → 选病人 → 选择Normal/Urgent/Emergency → 提交 | ✅ 成功添加，无"integer"错误 |
| **创建Consultation** | `/consultations/new` → 填表 → 保存 | ✅ 成功保存，无"consultation_number"错误 |
| **创建Invoice** | `/invoices/new` → 选病人 → 添加项目 → 创建 | ✅ 成功创建 |
| **Generate CSV** | `/reports` → 点任意Generate CSV | ✅ 下载CSV文件 |

---

## 🔍 如果还有问题

### 检查SQL是否成功执行

运行这个查询验证:

```sql
-- 检查priority_level类型
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'queues' AND column_name = 'priority_level';

-- 应该显示: integer

-- 检查consultation_number存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'consultations' AND column_name = 'consultation_number';

-- 应该显示: consultation_number
```

### 查看浏览器Console错误

1. 按 **F12** 打开开发者工具
2. 点击 **Console** 标签
3. 尝试操作，查看红色错误信息
4. 截图发给我

---

## 📊 修复详情 (Technical Details)

### Priority Level修复

**之前**:
```typescript
priority: "normal"  // ❌ 字符串
```

**现在**:
```typescript
priority_level: 1  // ✅ 整数 (1=normal, 2=urgent, 3=emergency)
```

### Consultation Number修复

**之前**:
```typescript
// ❌ 没有consultation_number
patient_id: selectedPatient.id,
doctor_id: user?.id,
```

**现在**:
```typescript
// ✅ 生成唯一号码
consultation_number: `CON${Date.now()}`,
patient_id: selectedPatient.id,
doctor_id: user?.id,
```

### RLS Policy修复

**之前**:
```sql
-- ❌ 只能更新自己的profile
USING (id = auth.uid())
```

**现在**:
```sql
-- ✅ 所有认证用户可以更新 (开发环境)
USING (true)
```

---

## 🎉 完成后

所有功能应该正常工作:
- ✅ Staff role可以更改并保存
- ✅ Queue添加成功
- ✅ Consultation创建成功
- ✅ Invoice创建成功
- ✅ CSV导出工作
- ✅ 所有按钮都是真正功能

---

## ⚠️ 重要提醒

**这个SQL关闭了RLS (Row Level Security)**，这只适合**开发环境**!

**生产环境**需要正确的RLS策略。当准备上线时，我会帮你设置安全的RLS策略。

---

## 需要帮助?

如果执行SQL后还有任何错误:
1. 截图错误信息
2. 告诉我哪个功能失败
3. 我会立即帮你解决

现在去执行 `emergency-fix.sql`! 🚀
