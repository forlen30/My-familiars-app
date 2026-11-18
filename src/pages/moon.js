import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView } from '../lib/ui.js';
import { getMoonToday, getUpcomingQuarters, getMonthCalendar } from '../lib/astro.js';
import { showHome } from './home.js';

const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const fmtDate = (d) => d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (d) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

let viewYear = null;
let viewMonth = null;

export function showMoonPage() {
  trackPageView('/moon', 'Moon Calendar');
  const root = getRoot();
  if (!root) return;
  window.scrollTo(0, 0);

  const now = new Date();
  if (viewYear === null) { viewYear = now.getFullYear(); viewMonth = now.getMonth(); }

  const moon = getMoonToday();
  const upcoming = getUpcomingQuarters(4);
  const cal = getMonthCalendar(viewYear, viewMonth);
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const isThisMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const cells = [
    ...Array(firstDow).fill('<div class="moon-cal-cell empty"></div>'),
    ...cal.map(c => `
      <div class="moon-cal-cell ${isThisMonth && c.day === now.getDate() ? 'today' : ''} ${['new', 'full'].includes(c.key) ? 'major' : ''}">
        <span class="moon-cal-day">${c.day}</span>
        <span class="moon-cal-emoji">${c.emoji}</span>
      </div>`)
  ].join('');

  root.innerHTML = `
    <div class="window moon-page">
      <h2>ปฏิทินจันทร์</h2>
      <div class="moon-hero">
        <div class="moon-hero-emoji">${moon.emoji}</div>
        <div class="moon-hero-name">${moon.nameTh}</div>
        <div class="moon-hero-sub">สว่าง ${moon.illuminationPct}% · ดวงจันทร์อยู่${moon.zodiac}</div>
      </div>
      <div class="moon-meaning">
        <p>${moon.meaning}</p>
        <p><strong>เหมาะกับ:</strong></p>
        <ul>${moon.workings.map(w => `<li>${w}</li>`).join('')}</ul>
        <p><strong>สีเทียนแนะนำ:</strong> ${moon.candle}</p>
      </div>

      <h3 class="moon-section-title">ข้างจันทร์ที่กำลังจะมาถึง</h3>
      <ul class="moon-upcoming">
        ${upcoming.map(u => `<li><span>${u.emoji} ${u.nameTh}</span><span>${fmtDate(u.date)} ${fmtTime(u.date)} น.</span></li>`).join('')}
      </ul>

      <h3 class="moon-section-title">
        <button class="moon-nav" id="moon-prev" aria-label="เดือนก่อน">‹</button>
        ${TH_MONTHS[viewMonth]} ${viewYear + 543}
        <button class="moon-nav" id="moon-next" aria-label="เดือนถัดไป">›</button>
      </h3>
      <div class="moon-cal">
        ${TH_DOW.map(d => `<div class="moon-cal-head">${d}</div>`).join('')}
        ${cells}
      </div>
      <p class="moon-note">คำนวณจากตำแหน่งจริงของดวงจันทร์ ตามเวลาในเครื่องของคุณ</p>
    </div>
    <div class="button-group"><button id="btn-back">กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => {
      play(sfxPop);
      viewYear = null; viewMonth = null;
      playSlideTransition(showHome);
    };
    document.getElementById('moon-prev').onclick = () => {
      play(sfxPop);
      viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      showMoonPage();
    };
    document.getElementById('moon-next').onclick = () => {
      play(sfxPop);
      viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      showMoonPage();
    };
  }, 30);
}
