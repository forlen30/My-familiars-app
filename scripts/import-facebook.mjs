#!/usr/bin/env node
// =====================================================================
// แปลงไฟล์ข้อมูลเพจ Facebook (Download Your Information แบบ JSON) → คลังความรู้ในแอป
//
// วิธีใช้:
//   1. นำไฟล์จาก Facebook ไว้ในโฟลเดอร์ เช่น  facebook-export/
//      รองรับ 2 แบบ (ใส่ปนกันในโฟลเดอร์เดียวได้ โพสต์ที่ซ้ำกันจะถูกตัดออก):
//        - ไฟล์ JSON จาก "ดาวน์โหลดข้อมูลของคุณ" (แตก zip ไว้) → ได้ข้อความ + รูป
//        - ไฟล์ CSV จาก Meta Business Suite (โหลดทีละปี ใส่ได้หลายไฟล์) → ได้ข้อความ + ลิงก์โพสต์ต้นฉบับ (ไม่มีรูป)
//   2. รัน:  npm run import:facebook -- facebook-export
//      ตัวเลือก:
//        --min-length 120    ข้ามโพสต์ที่สั้นกว่านี้ (ตัวอักษร) ค่าเริ่มต้น 120
//        --no-images         ไม่คัดลอกรูป
//
// ผลลัพธ์:
//   public/data/articles.json          → แอปใช้แสดงคลังความรู้ได้ทันที (ไม่ต้องมี Supabase)
//   public/library-images/*.jpg        → รูปที่ย่อขนาดแล้ว
//   import-output/articles.csv         → สำหรับนำเข้า Supabase ตาราง articles
//   import-output/article_bodies.csv   → สำหรับนำเข้า Supabase ตาราง article_bodies
//   import-output/review.csv           → รายการให้ตรวจทาน (หมวด / ชื่อเรื่อง)
//
// ความเป็นส่วนตัว (PDPA):
//   - อ่านเฉพาะ "โพสต์ของเพจเอง" ไม่อ่านคอมเมนต์ ข้อความ inbox หรือข้อมูลผู้ติดตาม
//   - ตัดอีเมลและเบอร์โทรที่พบในเนื้อหาออกอัตโนมัติ
//   - ควรตรวจทาน review.csv ก่อนเผยแพร่ เพราะอาจมีชื่อคนที่ถูกแท็กอยู่ในข้อความ
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const exportDir = args.find(a => !a.startsWith('--'));
const minLength = Number(args[args.indexOf('--min-length') + 1]) || 120;
const withImages = !args.includes('--no-images');

if (!exportDir || !fs.existsSync(exportDir)) {
  console.error('❌ กรุณาระบุโฟลเดอร์ที่แตกไฟล์จาก Facebook ไว้ เช่น: npm run import:facebook -- facebook-export');
  process.exit(1);
}

// ---------- หมวดหมู่ (แก้คำสำคัญได้ตามต้องการ) ----------
const CATEGORIES = [
  ['ข่าวสารและสินค้า', ['พร้อมส่ง', 'pre-order', 'พรีออเดอร์', 'สั่งซื้อ', 'for sale', 'ราคา', 'จัดส่ง', 'โอนเงิน', 'inbox', 'ทักแชท', 'congrats', 'sponsored']],
  ['ภาษาดอกไม้และพฤกษา', ['ดอกไม้', 'ภาษาดอกไม้', 'flower', 'ต้นไม้', 'พืช', 'ผลไม้']],
  ['สมุนไพรเวท', ['สมุนไพร', 'herb', 'โรสแมรี่', 'ลาเวนเดอร์', 'เสจ', 'อบเชย', 'กานพลู', 'ชินนามอน']],
  ['ตำนานและเทพปกรณัม', ['ตำนาน', 'เทพ', 'ปกรณัม', 'myth', 'ญิณ', 'จินนี่', 'ปีศาจ', 'อสูร', 'เมดูซ่า']],
  ['คริสตัลและหิน', ['คริสตัล', 'crystal', 'หินนำโชค', 'อเมทิสต์', 'ควอตซ์', 'ออบซิเดียน']],
  ['เวทมนตร์เทียน', ['เทียน', 'candle magic']],
  ['ไพ่และการพยากรณ์', ['ไพ่', 'ทาโรต์', 'ทาโร่', 'tarot', 'oracle', 'ออราเคิล', 'พยากรณ์', 'รูน', 'rune']],
  ['ดวงจันทร์', ['จันทร์เต็มดวง', 'จันทร์ดับ', 'ข้างขึ้น', 'ข้างแรม', 'full moon', 'new moon', 'blue moon', 'ดวงจันทร์', 'พระจันทร์']],
  ['วันสะบัต', ['สะบัต', 'sabbat', 'samhain', 'ซาวิน', 'yule', 'ยูล', 'beltane', 'เบลเทน', 'imbolc', 'ostara', 'litha', 'mabon', 'lughnasadh', 'lammas']],
  ['โหราศาสตร์และดวงดาว', ['ราศี', 'ดาวพุธ', 'ดาวศุกร์', 'ดาวอังคาร', 'ดาวพฤหัส', 'ดาวเสาร์', 'โหรา', 'astrology', 'retrograde', 'ดาวหาง']],
  ['หนังสือและตำราเวท', ['หนังสือ', 'ตำรา', 'grimoire', 'กรีมัวร์', 'บันทึกโบราณ']],
  ['คาถาและพิธีกรรม', ['คาถา', 'spell', 'พิธี', 'ritual', 'แม่มด', 'manifest', 'แมนิเฟสต์', 'ธาตุ']],
];
const DEFAULT_CATEGORY = 'เกร็ดความรู้';

// Facebook เข้ารหัสภาษาไทยในไฟล์ JSON ผิดแบบ (latin1) ต้องแปลงกลับเป็น UTF-8
const fixText = (s) => {
  if (typeof s !== 'string') return '';
  try {
    const fixed = Buffer.from(s, 'latin1').toString('utf8');
    return fixed.includes('�') ? s : fixed;
  } catch { return s; }
};

const scrubPersonal = (s) => s
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[อีเมล]')
  .replace(/(?:\+66|0)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}/g, '[เบอร์โทร]');

function categorize(text) {
  // ตัดชื่อเพจ/ลิงก์ออกก่อน ไม่ให้คำว่า Books ในชื่อเพจทำให้ทุกโพสต์ไปอยู่หมวดหนังสือ
  const t = text.toLowerCase().replace(/magic books\s*&?\s*candle/g, '').replace(/https?:\/\/\S+/g, '');
  let best = DEFAULT_CATEGORY, bestScore = 0;
  for (const [name, words] of CATEGORIES) {
    const score = words.reduce((n, w) => n + (t.split(w.toLowerCase()).length - 1), 0);
    if (score > bestScore) { best = name; bestScore = score; }
  }
  return best;
}

function makeTitle(text) {
  const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0) || 'ไม่มีชื่อเรื่อง';
  const clean = firstLine.replace(/[#*_~]+/g, '').trim();
  return clean.length > 90 ? clean.slice(0, 87) + '…' : clean;
}

// ---------- หาไฟล์โพสต์ในโฟลเดอร์ export ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/posts?.*\.json$/i.test(e.name) && !/comment|message|inbox/i.test(p)) out.push(p);
    else if (/\.csv$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(exportDir);
if (files.length === 0) {
  console.error('❌ ไม่พบไฟล์โพสต์ (*posts*.json หรือ *.csv) — ตรวจว่าเลือกรูปแบบ JSON/CSV และเลือกหมวด "โพสต์" ตอนขอไฟล์จาก Facebook');
  process.exit(1);
}

// ---------- อ่าน CSV (รองรับข้อความหลายบรรทัดในเครื่องหมายคำพูด) ----------
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// หัวคอลัมน์ของ Meta Business Suite (ภาษาไทย / อังกฤษ)
const COL = {
  id: ['ID โพสต์', 'Post ID'],
  text: ['คำอธิบาย', 'Description', 'ชื่อ', 'Title', 'ข้อความ', 'Message'],
  time: ['เวลาที่เผยแพร่', 'Publish time'],
  url: ['ลิงก์ถาวร', 'Permalink'],
  type: ['ประเภทโพสต์', 'Post type']
};

// เวลาในไฟล์เป็นรูปแบบ MM/DD/YYYY HH:mm (เวลาของเพจ) → ถือเป็นเวลาไทย
function parseMetaTime(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/.exec(s || '');
  if (!m) return null;
  const [, mo, d, y, h, mi] = m.map(Number);
  return Math.floor(Date.UTC(y, mo - 1, d, h - 7, mi) / 1000);
}

function readCsvPosts(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  if (rows.length < 2) return [];
  const header = rows[0].map(h => h.trim());
  const idx = (names) => names.map(n => header.indexOf(n)).filter(i => i >= 0);
  const idI = idx(COL.id)[0], textI = idx(COL.text), timeI = idx(COL.time)[0], urlI = idx(COL.url)[0], typeI = idx(COL.type)[0];
  if (idI === undefined || textI.length === 0) return [];   // ไม่ใช่ไฟล์โพสต์ของ Meta
  return rows.slice(1).filter(r => r.length > 1).map(r => {
    const text = textI.map(i => r[i] || '').sort((a, b) => b.length - a.length)[0];
    const url = r[urlI] || '';
    return {
      postId: r[idI],
      timestamp: parseMetaTime(r[timeI]),
      text,
      media: [],
      // เก็บเฉพาะลิงก์ของ facebook.com เท่านั้น (ไม่นำตัวเลขสถิติ/รายได้เข้าแอป)
      url: /^https:\/\/(www\.)?facebook\.com\//.test(url) ? url : null,
      type: r[typeI] || ''
    };
  });
}

const posts = [];
for (const f of files) {
  if (/\.csv$/i.test(f)) { posts.push(...readCsvPosts(f)); continue; }
  let data;
  try { data = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
  const list = Array.isArray(data) ? data : (data.status_updates_v2 || data.posts || data.page_posts || []);
  for (const p of list) {
    if (!p || typeof p !== 'object') continue;
    const text = (p.data || []).map(d => fixText(d.post || '')).filter(Boolean).join('\n\n');
    const media = [];
    for (const a of p.attachments || []) {
      for (const d of a.data || []) {
        if (d.media?.uri && /\.(jpe?g|png|webp)$/i.test(d.media.uri)) media.push(d.media.uri);
        if (!text && d.media?.description) p._fallback = fixText(d.media.description);
      }
    }
    posts.push({ timestamp: p.timestamp, text: text || p._fallback || '', media });
  }
}

// ---------- คัดและแปลง ----------
const seen = new Set();
const articles = [];
for (const p of posts) {
  const body = scrubPersonal(p.text.trim());
  if (body.length < minLength) continue;
  const key = body.slice(0, 200);
  if (seen.has(key)) continue;            // ตัดโพสต์ซ้ำ
  seen.add(key);
  const id = `fb-${p.postId || p.timestamp || articles.length}`;
  articles.push({
    id,
    title: makeTitle(body),
    excerpt: body.replace(/\s+/g, ' ').slice(0, 160),
    category: categorize(body),
    published_at: p.timestamp ? new Date(p.timestamp * 1000).toISOString() : null,
    body,
    image_url: null,
    source_url: p.url || null,
    _media: p.media[0] || null
  });
}
articles.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));

// ---------- รูปภาพ (ย่อเหลือกว้าง 900px, JPEG) ----------
if (withImages) {
  let sharp;
  try { sharp = (await import('sharp')).default; } catch { console.warn('⚠️ ไม่พบ sharp ข้ามการคัดลอกรูป'); }
  if (sharp) {
    const outDir = path.join('public', 'library-images');
    fs.mkdirSync(outDir, { recursive: true });
    let n = 0;
    for (const a of articles) {
      if (!a._media) continue;
      const src = path.join(exportDir, a._media);
      if (!fs.existsSync(src)) continue;
      const name = `${a.id}.jpg`;
      try {
        await sharp(src).rotate().resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(outDir, name));
        a.image_url = `/library-images/${name}`;
        n++;
      } catch { /* ข้ามรูปที่อ่านไม่ได้ */ }
    }
    console.log(`🖼️  ย่อรูปแล้ว ${n} รูป → ${outDir}`);
  }
}

// ---------- เขียนไฟล์ผลลัพธ์ ----------
const categories = [...new Set(articles.map(a => a.category))].sort((a, b) => a.localeCompare(b, 'th'));
fs.mkdirSync(path.join('public', 'data'), { recursive: true });
fs.writeFileSync(
  path.join('public', 'data', 'articles.json'),
  JSON.stringify({ generated_at: new Date().toISOString(), categories, articles: articles.map(({ _media, ...a }) => a) })
);

const csv = (rows, cols) => [cols.join(','), ...rows.map(r => cols.map(c => {
  const v = r[c] ?? '';
  return `"${String(v).replace(/"/g, '""')}"`;
}).join(','))].join('\n');

fs.mkdirSync('import-output', { recursive: true });
fs.writeFileSync('import-output/articles.csv',
  csv(articles.map(a => ({ ...a, is_premium: 'false', status: 'published', source: 'facebook' })),
    ['id', 'title', 'excerpt', 'category', 'published_at', 'is_premium', 'status', 'source', 'source_url']));
fs.writeFileSync('import-output/article_bodies.csv',
  csv(articles.map(a => ({ article_id: a.id, body: a.body, image_url: a.image_url })), ['article_id', 'body', 'image_url']));
fs.writeFileSync('import-output/review.csv',
  '﻿' + csv(articles, ['id', 'published_at', 'category', 'title', 'source_url']));

const byCat = categories.map(c => `   - ${c}: ${articles.filter(a => a.category === c).length}`).join('\n');
console.log(`✅ พบโพสต์ทั้งหมด ${posts.length} โพสต์ → นำเข้าเป็นบทความ ${articles.length} เรื่อง (ข้ามโพสต์สั้นกว่า ${minLength} ตัวอักษร)\n${byCat}`);
console.log('📄 public/data/articles.json  |  import-output/*.csv  (เปิด review.csv ใน Excel/Google Sheets เพื่อตรวจทาน)');
