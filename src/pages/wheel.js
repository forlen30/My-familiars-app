import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView, setNav } from '../lib/ui.js';
import { getSabbatsForYear, getNextSabbat } from '../lib/astro.js';
import { showHome } from './home.js';

const fmt = (d) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

export function showWheelPage() {
  trackPageView('/wheel', 'Wheel of the Year');
  setNav('home');
  const root = getRoot();
  if (!root) return;
  window.scrollTo(0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = getNextSabbat(now);
  const daysLeft = Math.round((next.date - today) / 86400000);
  const list = getSabbatsForYear(now.getFullYear());

  root.innerHTML = `
    <div class="window wheel-page">
      <h2>กงล้อแห่งปี</h2>
      <p>วันสะบัตทั้ง 8 ของปี ${now.getFullYear() + 543}</p>
      <div class="wheel-next">
        <div class="wheel-next-emoji">${next.emoji}</div>
        <div><strong>${next.nameTh}</strong> <span class="wheel-en">${next.name}</span></div>
        <div>${fmt(next.date)}</div>
        <div class="wheel-countdown">${daysLeft === 0 ? 'วันนี้!' : `อีก ${daysLeft} วัน`}</div>
        <p>${next.theme}</p>
      </div>
      <ul class="wheel-list">
        ${list.map((s, idx) => `
          <li style="--i:${idx}" class="${s.date < today ? 'past' : ''} ${s.key === next.key && s.date.getTime() === next.date.getTime() ? 'next' : ''}">
            <span class="wheel-list-emoji">${s.emoji}</span>
            <span class="wheel-list-text"><strong>${s.nameTh}</strong><br><small>${fmt(s.date)}</small></span>
          </li>`).join('')}
      </ul>
      <p class="moon-note">วันวิษุวัตและอายันคำนวณตามดาราศาสตร์จริงของแต่ละปี (ซีกโลกเหนือ)</p>
    </div>
    <div class="button-group"><button id="btn-back">กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showHome); };
  }, 30);
}
