# My Familiars (เวอร์ชัน 1.4.0)

แอปของเพจ **Magic Books & Candle** — ไพ่สัตว์ประจำวัน คำถามรายวัน สมุนไพรเวท ปฏิทินจันทร์ กงล้อแห่งปี และคลังความรู้

## อัปขึ้นเว็บ (Netlify) — ทำครั้งเดียว
1. อัปโหลดทั้งโฟลเดอร์นี้ขึ้น GitHub แทนของเดิม (ไม่ต้องอัปโฟลเดอร์ `node_modules` และ `dist`)
2. Netlify จะอ่าน `netlify.toml` แล้วสั่ง `npm run build` ให้เอง และเปิดเว็บจากโฟลเดอร์ `dist`
3. ถ้า Netlify เคยตั้ง "Publish directory" เป็น `.` ไว้ ให้ลบค่าในหน้า Site configuration → Build & deploy เพื่อให้ใช้ค่าจากไฟล์

## ทดสอบในเครื่อง
```bash
npm install      # ครั้งแรกครั้งเดียว
npm run dev      # เปิด http://localhost:5173 (มีเมนูผู้พัฒนา: คลิกข้อความท้ายแอป 15 ครั้ง)
```

## แก้เนื้อหาที่ไหน
| อยากแก้ | ไฟล์ |
|---|---|
| ไพ่สัตว์ | `src/data/cards.js` |
| ความหมายข้างจันทร์ / วันสะบัต / สีเทียน | `src/data/sky-content.js` |
| คำถามรายวัน | `public/questions.json` |
| สมุนไพร | `public/herbs.json` |
| ผู้สนับสนุน | `src/pages/supporters.js` |
| ข้อความแจ้งอัปเดต | `public/update-info.json` |
| นโยบายความเป็นส่วนตัว | `public/privacy.html` (เติมช่อง [ ] ก่อนเปิดระบบสมาชิก) |

## นำเข้าข้อมูลเพจ Facebook
```bash
npm run import:facebook -- โฟลเดอร์ที่แตกไฟล์จาก-facebook
```
ผลลัพธ์อยู่ที่ `public/data/articles.json` (แอปใช้ได้ทันที) และ `import-output/` (ไฟล์ CSV สำหรับ Supabase + `review.csv` สำหรับตรวจทาน)

## ระบบสมาชิก (ยังปิดอยู่)
แอปทำงานได้ปกติโดยไม่ต้องมี Supabase เมนู "บัญชีของฉัน" จะปรากฏเมื่อตั้งค่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ใน Netlify แล้ว
ขั้นตอนทั้งหมดดูได้ในคู่มือ และโครงสร้างฐานข้อมูลอยู่ที่ `supabase/schema.sql`

## ความปลอดภัย
- ไม่มี key ใด ๆ อยู่ในโค้ด ทุกค่าตั้งใน Netlify
- ทุกตารางเปิด RLS สิทธิ์พรีเมียมให้ได้จาก server เท่านั้น
- เมนูผู้พัฒนาถูกตัดออกจากเว็บจริงแล้ว
- ข้อความจากผู้ใช้และฐานข้อมูลผ่าน `escapeHtml` ก่อนแสดงทุกครั้ง
