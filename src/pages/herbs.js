import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, setNav } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { showHome } from './home.js';

const PLANETS = [
  { key: 'sun', name: 'ดวงอาทิตย์', img: 'sun' },
  { key: 'moon', name: 'ดวงจันทร์', img: 'moon' },
  { key: 'mars', name: 'ดาวอังคาร', img: 'mars' },
  { key: 'mercury', name: 'ดาวพุธ', img: 'mercury' },
  { key: 'venus', name: 'ดาวศุกร์', img: 'venus' },
  { key: 'jupiter', name: 'ดาวพฤหัส', img: 'jupiter' },
  { key: 'saturn', name: 'ดาวเสาร์', img: 'saturn' }
];
const AVAILABLE_PLANETS = ['sun']; // เปิดแค่ sun (เหมือนเดิม)

export function showHerbPage() {
  window.scrollTo(0, 0);
  setNav('home');
  const root = getRoot();
  if (!root) return;

  root.innerHTML = `
    <div class="window herb-page-box">
      <h2>สารานุกรมสมุนไพรเวท</h2>
      <p>เลือกดวงดาวเพื่อสำรวจสมุนไพร</p>
      <div class="herb-planet-grid">
        ${PLANETS.map(p => `<div class="herb-planet" id="btn-herb-${p.key}"><img src="/images/${p.img}.png" alt=""><span>${p.name}</span></div>`).join('')}
      </div>
    </div>
    <div class="button-group"><button id="btn-herb-back">กลับ</button></div>
  `;

  setTimeout(() => {
    document.querySelectorAll('.herb-planet').forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.add('fade-up');
    });

    PLANETS.forEach(({ key, name }) => {
      const btn = document.getElementById(`btn-herb-${key}`);
      if (!btn) return;
      btn.onclick = () => {
        play(sfxPop);
        if (AVAILABLE_PLANETS.includes(key)) {
          playSlideTransition(() => showHerbListPage(name));
        } else {
          root.innerHTML = `
            <div class="window fade-in">
              <h2>ยังไม่พร้อมใช้งาน</h2>
              <p>ข้อมูลของ <strong>${name}</strong> กำลังรอการอัปเดตนะคะ<br>โปรดติดตามในเวอร์ชันถัดไปค่ะ</p>
            </div>
            <div class="button-group"><button id="btn-herb-back">กลับ</button></div>
          `;
          setTimeout(() => {
            document.getElementById('btn-herb-back').onclick = () => { play(sfxPop); playSlideTransition(showHerbPage); };
          }, 30);
        }
      };
    });

    document.getElementById('btn-herb-back').onclick = () => { play(sfxPop); playSlideTransition(showHome); };
  }, 30);
}

async function showHerbListPage(planetName) {
  window.scrollTo(0, 0);
  const root = getRoot();
  if (!root) return;

  const data = await fetch('/herbs.json?v=' + Date.now()).then(r => r.json());
  const planetData = data.find(entry => entry.planet === planetName);
  if (!planetData || !planetData.herbs) {
    root.innerHTML = `<div class="window"><h2>ไม่พบข้อมูลของ ${escapeHtml(planetName)}</h2></div>`;
    return;
  }

  const cardsHtml = planetData.herbs.map((herb, index) => `
    <div class="herb-card" data-index="${index}">
      <img src="/images/${encodeURI(herb.img)}" alt="${escapeHtml(herb.name)}" class="herb-img" />
      <div class="herb-name">${escapeHtml(herb.name)}</div>
      <div class="herb-sci">${escapeHtml(herb.sci)}</div>
    </div>
  `).join('');

  root.innerHTML = `
    <div class="window">
      <h2>สมุนไพรประจำ ${escapeHtml(planetName)}</h2>
      <div class="herb-card-grid">${cardsHtml}</div>
    </div>
    <div class="button-group"><button id="btn-herb-backlist">กลับ</button></div>
  `;

  setTimeout(() => {
    document.querySelectorAll('.herb-card').forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-up');
      card.onclick = () => {
        play(sfxPop);
        showHerbDetail(planetData.herbs[parseInt(card.dataset.index, 10)], planetName);
      };
    });
    document.getElementById('btn-herb-backlist').onclick = () => { play(sfxPop); playSlideTransition(showHerbPage); };
  }, 30);
}

function showHerbDetail(herb, planetName) {
  window.scrollTo(0, 0);
  const root = getRoot();
  if (!root) return;
  const v = (x) => escapeHtml(x || '–');

  root.innerHTML = `
    <div class="window">
      <div class="herb-detail">
        <h2 class="fade-up" style="animation-delay: 0.1s">สมุนไพรประจำ ${escapeHtml(planetName)}</h2>
        <img class="herb-img-detail fade-up" style="animation-delay: 0.2s" src="/images/${encodeURI(herb.img)}" alt="${escapeHtml(herb.name)}">
        <h3 class="fade-up" style="animation-delay: 0.3s">${escapeHtml(herb.name)}</h3>
        <em class="fade-up" style="animation-delay: 0.4s">${escapeHtml(herb.sci)}</em>
        <p class="fade-up" style="animation-delay: 0.5s"><strong>ธาตุ:</strong> ${v(herb.element)}</p>
        <p class="fade-up" style="animation-delay: 0.6s"><strong>สี:</strong> ${v(herb.color)}</p>
        <p class="fade-up" style="animation-delay: 0.7s"><strong>เทพที่เกี่ยวข้อง:</strong> ${v(herb.deity)}</p>
        <p class="fade-up" style="animation-delay: 0.8s"><strong>มักใช้ในพิธี:</strong> ${v(herb.magical_use)}</p>
      </div>
    </div>
    <div class="button-group"><button id="btn-herb-backlist">กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-herb-backlist').onclick = () => {
      play(sfxPop);
      playSlideTransition(() => showHerbListPage(planetName));
    };
  }, 30);
}
