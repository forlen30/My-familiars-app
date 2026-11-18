# ส่วนที่เก็บสำรองไว้ (ยังไม่ใช้งาน)

ย้ายออกมาจากแอปเพื่อไม่ให้มีอะไรเสี่ยงค่าใช้จ่าย ไฟล์ในโฟลเดอร์นี้ **ไม่ถูกรวมในเว็บ** (Vite ไม่ build และ Netlify ไม่รันเป็น function)

| ไฟล์ | คืออะไร | ย้ายกลับไปไว้ที่ |
|---|---|---|
| membership/src/lib/supabase.js | การเชื่อมต่อ Supabase | src/lib/ |
| membership/src/lib/account.js | เข้าสู่ระบบ / สิทธิ์พรีเมียม / ลบบัญชี | src/lib/ |
| membership/src/pages/account.js | หน้า "บัญชีของฉัน" | src/pages/ |
| membership/netlify/functions/payment-webhook.js | โครงระบบรับเงิน | netlify/functions/ |
| membership/netlify/functions/get-user.js | function เดิมจากเวอร์ชัน 1.3 (ไม่ได้ใช้แล้ว) | netlify/functions/ |
| membership/supabase/schema.sql | โครงสร้างฐานข้อมูล + RLS | supabase/ |
| membership/.env.example | รายชื่อ Environment variables | ชั้นนอกสุดของโปรเจกต์ |

เมื่อจะเปิดใช้: ย้ายไฟล์กลับ, รัน `npm install @supabase/supabase-js`, แล้วเพิ่มปุ่ม "บัญชีของฉัน" กลับในหน้าแรก
