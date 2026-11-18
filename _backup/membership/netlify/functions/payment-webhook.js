// โครงระบบรับเงิน (ยังไม่เปิดใช้งาน)
//
// ทำงานอย่างไรเมื่อเปิดใช้:
//   1. ผู้ใช้จ่ายเงินที่หน้าของผู้ให้บริการ (เช่น Omise / 2C2P / Patreon)
//   2. ผู้ให้บริการส่ง webhook มาที่ไฟล์นี้
//   3. ไฟล์นี้ "ตรวจลายเซ็น" ว่ามาจากผู้ให้บริการจริง แล้วจึงให้สิทธิ์พรีเมียมในตาราง entitlements
//
// ความปลอดภัย:
//   - ห้ามให้สิทธิ์พรีเมียมจากหน้าเว็บเด็ดขาด ต้องมาจากที่นี่เท่านั้น
//   - SUPABASE_SERVICE_ROLE_KEY และ PAYMENT_WEBHOOK_SECRET ตั้งใน Netlify (Environment variables)
//     ห้ามขึ้นต้นด้วย VITE_ เพราะตัวแปรที่ขึ้นต้นด้วย VITE_ จะถูกฝังลงในหน้าเว็บ
const crypto = require('crypto');

exports.handler = async function (event) {
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    return { statusCode: 503, body: 'payments not enabled' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'method not allowed' };
  }

  // TODO: เปลี่ยนชื่อ header และวิธีตรวจให้ตรงกับเอกสารของผู้ให้บริการที่เลือก
  const signature = event.headers['x-signature'] || '';
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || '';
  const expected = crypto.createHmac('sha256', secret).update(event.body || '').digest('hex');
  const valid = secret && signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return { statusCode: 401, body: 'invalid signature' };
  }

  // TODO: อ่านข้อมูลการชำระเงินตามรูปแบบของผู้ให้บริการ แล้ว:
  //   - บันทึกลง payments (provider_ref ต้องไม่ซ้ำ เพื่อกันการให้สิทธิ์ซ้ำ)
  //   - upsert ลง entitlements ให้ premium_until = วันที่ + ระยะเวลาที่จ่าย
  // ใช้ createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  return { statusCode: 501, body: 'not implemented yet' };
};
