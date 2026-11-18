import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView, setNav } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { showHome } from './home.js';

// แก้รายชื่อผู้สนับสนุนได้ที่นี่ที่เดียว
const SUPPORTERS = [
  'Aikankankorn Wongthanaphum',
  'anuthida chuayrueang',
  'Aranya Lindroos',
  'คุณ พัชราภรณ์',
  'Thanattha',
  'คุณ ธนัญรัตน์',
  'Malangpor Natphat',
  'Jessica Severa'
];

export function showSupporterPage() {
  trackPageView('/supporters', 'Supporters Page');
  setNav('home');
  const root = getRoot();
  if (!root) return;

  root.innerHTML = `
    <div class="window">
      <h1>ขอบคุณผู้สนับสนุน</h1>
      <p style="margin-top:1em;">แอพนี้เกิดขึ้นได้ด้วยพลังแห่งความรักจากทุกท่าน 💖💖💖 </p>
      <ul class="supporter-list">
        ${SUPPORTERS.map((n, i) => `<li style="--i:${i}">✦ ${escapeHtml(n)}</li>`).join('')}
      </ul>
    </div>
    <div class="button-group"><button id="btn-back"> กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showHome); };
  }, 30);
}
