// กันข้อความที่ผู้ใช้พิมพ์เอง (เช่น ชื่อ) ไม่ให้ถูกตีความเป็นโค้ด HTML
// ใช้ทุกครั้งที่นำข้อความจากผู้ใช้หรือจากฐานข้อมูลไปใส่ใน innerHTML
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
