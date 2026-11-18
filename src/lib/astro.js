// คำนวณข้างจันทร์ ราศีของดวงจันทร์ และวันสะบัต
// คำนวณในเครื่องผู้ใช้ทั้งหมดด้วย astronomy-engine (ฟรี ไม่ต้องเรียก API ภายนอก ใช้งานออฟไลน์ได้)
import * as Astronomy from 'astronomy-engine';
import { MOON_PHASES, ZODIAC_TH, SABBATS } from '../data/sky-content.js';

const QUARTER_KEYS = ['new', 'first-quarter', 'full', 'last-quarter'];

// มุมข้างจันทร์ 0-360 องศา -> หนึ่งใน 8 ช่วง
function phaseFromAngle(angle) {
  // ช่วงหลัก (ดับ/ครึ่ง/เต็ม) ให้กว้าง ±12° เพื่อให้ตรงกับที่คนเห็นจริง
  if (angle < 12 || angle >= 348) return 'new';
  if (angle < 78) return 'waxing-crescent';
  if (angle < 102) return 'first-quarter';
  if (angle < 168) return 'waxing-gibbous';
  if (angle < 192) return 'full';
  if (angle < 258) return 'waning-gibbous';
  if (angle < 282) return 'last-quarter';
  return 'waning-crescent';
}

export function getMoonInfo(date = new Date()) {
  const angle = Astronomy.MoonPhase(date);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction;
  const lon = Astronomy.EclipticGeoMoon(date).lon;
  const phase = MOON_PHASES.find(p => p.key === phaseFromAngle(angle));
  return {
    ...phase,
    angle,
    illuminationPct: Math.round(illum * 100),
    zodiac: ZODIAC_TH[Math.floor((((lon % 360) + 360) % 360) / 30)]
  };
}

// สำหรับการ์ดหน้าแรก: ใช้เวลา 3 ทุ่มคืนนี้ เพื่อให้ตรงกับที่ผู้ใช้เห็นบนฟ้า
export function getMoonToday() {
  const d = new Date();
  d.setHours(21, 0, 0, 0);
  return getMoonInfo(d);
}

// ข้างจันทร์หลัก (ดับ / ขึ้นครึ่ง / เต็ม / แรมครึ่ง) ที่จะมาถึง
export function getUpcomingQuarters(count = 8, from = new Date()) {
  const out = [];
  let mq = Astronomy.SearchMoonQuarter(from);
  for (let i = 0; i < count; i++) {
    const phase = MOON_PHASES.find(p => p.key === QUARTER_KEYS[mq.quarter]);
    out.push({ ...phase, date: mq.time.date });
    mq = Astronomy.NextMoonQuarter(mq);
  }
  return out;
}

// ปฏิทินรายเดือน: คืนค่าข้างจันทร์ของแต่ละวัน (เวลา 3 ทุ่ม)
export function getMonthCalendar(year, month /* 0-11 */) {
  const days = new Date(year, month + 1, 0).getDate();
  const out = [];
  for (let day = 1; day <= days; day++) {
    const d = new Date(year, month, day, 21, 0, 0);
    const info = getMoonInfo(d);
    out.push({ day, date: d, emoji: info.emoji, key: info.key, illuminationPct: info.illuminationPct });
  }
  return out;
}

function sabbatDate(sabbat, year) {
  if (sabbat.type === 'fixed') return new Date(year, sabbat.month - 1, sabbat.day);
  const t = Astronomy.Seasons(year)[sabbat.season].date;
  // แสดงเป็นวันที่ตามเวลาเครื่องผู้ใช้
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

export function getSabbatsForYear(year) {
  return SABBATS.map(s => ({ ...s, date: sabbatDate(s, year) })).sort((a, b) => a.date - b.date);
}

export function getNextSabbat(from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const list = [...getSabbatsForYear(from.getFullYear()), ...getSabbatsForYear(from.getFullYear() + 1)];
  return list.find(s => s.date >= today);
}
