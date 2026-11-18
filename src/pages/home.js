import { cards } from '../data/cards.js';
import { loadPlayerData, savePlayerData, getRankFromExp, getExpProgress, todayKey } from '../lib/player.js';
import { sfxPop, sfxCollect, sfxProgressBar, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView, setNav } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { getMoonToday, getNextSabbat } from '../lib/astro.js';
import { moonSvg } from '../lib/moon-svg.js';
import { sparkAt } from '../lib/fx.js';
import { showRegistrationPage } from './registration.js';
import { showCardPage } from './card.js';
import { showDailyQuestionPage } from './questions.js';
import { showHerbPage } from './herbs.js';
import { showCollectionHubPage } from './collection.js';
import { showSupporterPage } from './supporters.js';
import { showMoonPage } from './moon.js';
import { showWheelPage } from './wheel.js';
import { showLibraryPage, showArticle, getDailyArticle } from './library.js';

let lastKnownExp = 0;

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'ราตรีสวัสดิ์';
  if (h < 12) return 'อรุณสวัสดิ์';
  if (h < 17) return 'สวัสดียามบ่าย';
  return 'สวัสดียามค่ำ';
}

function todaysCard(playerData) {
  if (playerData.lastCardDrawDate !== todayKey()) return null;
  try {
    const stored = JSON.parse(localStorage.getItem('dailyCard'));
    return stored ? cards.find(c => c.name === stored.name) || null : null;
  } catch { return null; }
}

function avatarCard(playerData, today) {
  if (today) return today;
  const last = (playerData.collectedCards || []).slice(-1)[0];
  return last ? cards.find(c => c.name === last) : null;
}

function skyStars() {
  let s = '';
  for (let i = 0; i < 22; i++) {
    s += `<i style="left:${Math.random() * 100}%;top:${Math.random() * 70}%;--d:${(2 + Math.random() * 3).toFixed(1)}s;--delay:${(-Math.random() * 4).toFixed(1)}s"></i>`;
  }
  return s;
}

const ARCHES = [
  { id: 'btn-herb', title: 'สมุนไพรเวท', sub: 'ตามดวงดาว', img: '/images/leaf.png', bg: 'linear-gradient(160deg,#c9f2dc,#fff1c7)' },
  { id: 'moon-box', title: 'ปฏิทินจันทร์', sub: 'ข้างขึ้นข้างแรม', img: '/images/moon.png', bg: 'linear-gradient(160deg,#5b3cc4,#c88bff)' },
  { id: 'wheel-box', title: 'กงล้อแห่งปี', sub: 'วันสะบัตทั้ง 8', img: '/images/wheel-of-the-year.png', bg: 'linear-gradient(160deg,#ffd3e8,#d6c7ff)', cls: 'spin-slow' },
  { id: 'library-box', title: 'คลังความรู้', sub: 'บทความจากเพจ', emoji: '🕯️', bg: 'linear-gradient(160deg,#ffcf9e,#ff9fc7)', cls: 'flicker' },
  { id: 'supporter-box', title: 'ผู้สนับสนุน', sub: 'ขอบคุณทุกพลังใจ', img: '/images/love.png', bg: 'linear-gradient(160deg,#ffd9e6,#ffe9c9)' },
  { id: 'egg-box', title: 'ภูติรับใช้', sub: 'ฟักไข่ภูติ', img: '/images/egg.png', bg: 'linear-gradient(160deg,#e3dcff,#ffe8d6)', soon: true }
];

export async function showHome(triggerCollectionAnimation = false) {
  const playerData = loadPlayerData();
  if (!playerData) {
    showRegistrationPage();
    return;
  }
  setNav('home');

  const triggerExpAnimation = sessionStorage.getItem('triggerExpAnimation') === 'true';
  if (triggerExpAnimation) sessionStorage.removeItem('triggerExpAnimation');

  const initialExpForDisplay = (triggerCollectionAnimation || triggerExpAnimation) ? lastKnownExp : playerData.exp;
  lastKnownExp = playerData.exp;

  trackPageView('/', 'Home Page');
  const expProgress = getExpProgress(initialExpForDisplay);
  const root = getRoot();
  if (!root) return;

  const moon = getMoonToday();
  const sabbat = getNextSabbat();
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const daysToSabbat = Math.round((sabbat.date - midnight) / 86400000);

  const card = todaysCard(playerData);
  const avatar = avatarCard(playerData, card);
  const questionDone = playerData.lastQuestionAnsweredDate === todayKey();
  const lore = await getDailyArticle();

  let i = 0;
  const rv = () => `style="--i:${i++}"`;

  root.innerHTML = `
    <div class="home-top reveal" ${rv()}>
      <div class="home-avatar ${avatar ? '' : 'empty'}" ${avatar ? `style="background-image:url('/${avatar.image}')"` : ''}>${avatar ? '' : '✦'}</div>
      <div class="home-hello">
        <small>${greeting()} ✦</small>
        <strong>${escapeHtml(playerData.username)}</strong>
        <span class="rank-pill">🔮 <span id="player-rank-container"><span class="player-rank-title">${escapeHtml(playerData.rank)}</span></span></span>
      </div>
      <button id="collection-button" class="button" aria-label="กรีมัวร์ของฉัน" style="padding:10px 14px">📖</button>
    </div>
    <div class="exp-wrap reveal" ${rv()}>
      <div class="exp-bar-container">
        <div class="exp-bar-fill" style="width:${expProgress.percentage}%"></div>
        <span class="exp-text">EXP ${expProgress.current} / ${expProgress.required}</span>
      </div>
    </div>

    <div class="sky-card reveal tilt" id="sky-card" ${rv()}>
      <div class="sky-stars">${skyStars()}</div>
      <div class="hill back"></div><div class="hill"></div>
      <div class="sky-row">
        ${moonSvg(moon.angle)}
        <div class="sky-text">
          <div class="sky-kicker">คืนนี้บนท้องฟ้า</div>
          <div class="sky-phase">${moon.nameTh}</div>
          <div class="sky-meta">สว่าง ${moon.illuminationPct}% · ดวงจันทร์อยู่${moon.zodiac}</div>
          <span class="sky-chip">${sabbat.emoji} ${sabbat.nameTh} · ${daysToSabbat === 0 ? 'วันนี้!' : `อีก ${daysToSabbat} วัน`}</span>
        </div>
      </div>
      <div class="sky-cta">
        <button class="button shimmer" id="btn-draw">${card ? '✦ ดูไพ่ประจำวันอีกครั้ง' : '✦ เปิดไพ่ประจำวัน'}</button>
      </div>
    </div>

    <div class="section-head reveal" ${rv()}><h3>ภารกิจวันนี้</h3><small>${(card ? 1 : 0) + (questionDone ? 1 : 0)} / 2 สำเร็จ</small></div>
    <div class="quest-list">
      <button class="quest reveal ${card ? 'done' : ''}" id="quest-card" ${rv()}>
        <span class="quest-thumb">${card ? `<img class="card-art" src="/${card.image}" alt="">` : '<img src="/images/card-in-box.png" alt="">'}</span>
        <span class="quest-body"><strong>${card ? `ภูติวันนี้: ${escapeHtml(card.name)}` : 'เปิดไพ่ภูติประจำวัน'}</strong><span>${card ? escapeHtml(card.message) : 'รับ +25 EXP'}</span></span>
        <span class="quest-check">✓</span>
      </button>
      <button class="quest reveal ${questionDone ? 'done' : ''}" id="btn-daily-question" ${rv()}>
        <span class="quest-thumb"><img src="/images/question-icon.png" alt=""></span>
        <span class="quest-body"><strong>คำถามเวทมนตร์รายวัน</strong><span>${questionDone ? 'ตอบแล้ววันนี้ กลับมาพรุ่งนี้นะ' : 'ตอบถูกรับ +25 EXP'}</span></span>
        <span class="quest-check">✓</span>
      </button>
    </div>

    <div class="section-head reveal" ${rv()}><h3>สำรวจโลกเวทมนตร์</h3><small>เลื่อนดู →</small></div>
    <div class="arch-scroller">
      ${ARCHES.map(a => `
        <button class="arch reveal ${a.soon ? 'soon' : ''}" id="${a.id}" ${rv()}>
          <span class="arch-art" style="--a-bg:${a.bg}">
            ${a.img ? `<img class="${a.cls || ''}" src="${a.img}" alt="">` : `<span class="emoji ${a.cls || ''}">${a.emoji}</span>`}
          </span>
          <strong>${a.title}</strong><span>${a.sub}</span>
        </button>`).join('')}
    </div>

    ${lore ? `
    <div class="section-head reveal" ${rv()}><h3>เกร็ดเวทประจำวัน</h3><small>จาก Magic Books &amp; Candle</small></div>
    <button class="lore-card reveal" id="lore-card" ${rv()}>
      <span class="lore-tag">${escapeHtml(lore.category || 'เกร็ดความรู้')}</span>
      <h4>${escapeHtml(lore.title)}</h4>
      <p>${escapeHtml(lore.excerpt || '')}</p>
      <span class="lore-more">อ่านต่อ →</span>
    </button>` : ''}
  `;

  setTimeout(() => {
    const go = (id, page) => {
      const el = document.getElementById(id);
      if (el) el.onclick = () => { play(sfxPop); playSlideTransition(page); };
    };
    go('btn-draw', showCardPage);
    go('quest-card', showCardPage);
    go('btn-daily-question', showDailyQuestionPage);
    go('supporter-box', showSupporterPage);
    go('btn-herb', showHerbPage);
    go('moon-box', showMoonPage);
    go('wheel-box', showWheelPage);
    go('library-box', showLibraryPage);
    const sky = document.getElementById('sky-card');
    sky.onclick = (e) => { if (!e.target.closest('#btn-draw')) { play(sfxPop); playSlideTransition(showMoonPage); } };
    const egg = document.getElementById('egg-box');
    if (egg) egg.onclick = () => {
      egg.animate?.([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 400 });
    };
    const loreEl = document.getElementById('lore-card');
    if (loreEl && lore) loreEl.onclick = () => { play(sfxPop); playSlideTransition(() => showArticle(lore.id, showHome)); };
    const collectionButton = document.getElementById('collection-button');
    collectionButton.onclick = () => { play(sfxPop); playSlideTransition(showCollectionHubPage); };

    if (!playerData.hasSeenDailyQuestion) {
      playerData.hasSeenDailyQuestion = true;
      savePlayerData(playerData);
    }

    if (triggerCollectionAnimation) {
      setTimeout(() => {
        const rect = collectionButton.getBoundingClientRect();
        const flyingCard = document.createElement('div');
        flyingCard.className = 'flying-card';
        flyingCard.style.setProperty('--start-x', `${window.innerWidth / 2}px`);
        flyingCard.style.setProperty('--start-y', `${window.innerHeight / 2}px`);
        flyingCard.style.setProperty('--target-x', `${rect.left + rect.width / 2}px`);
        flyingCard.style.setProperty('--target-y', `${rect.top + rect.height / 2}px`);
        document.body.appendChild(flyingCard);
        setTimeout(() => {
          flyingCard.remove();
          collectionButton.classList.add('pop-effect');
          sparkAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
          play(sfxCollect);
          setTimeout(() => {
            collectionButton.classList.remove('pop-effect');
            if (playerData.exp > initialExpForDisplay) playExpBarAnimation(playerData, initialExpForDisplay);
          }, 500);
        }, 1500);
      }, 700);
    } else if (triggerExpAnimation) {
      setTimeout(() => playExpBarAnimation(playerData, initialExpForDisplay), 500);
    }
  }, 50);
}

function playExpBarAnimation(playerData, initialExp) {
  const expDisplayElement = document.querySelector('.exp-text');
  const expFillElement = document.querySelector('.exp-bar-fill');
  if (!expDisplayElement || !expFillElement) return;
  play(sfxProgressBar);

  const finalExp = playerData.exp;
  const duration = 1000;
  const perMs = (finalExp - initialExp) / duration;
  const animate = (startTime) => {
    const elapsed = performance.now() - startTime;
    if (elapsed < duration) {
      const value = Math.min(finalExp, initialExp + perMs * elapsed);
      const p = getExpProgress(value);
      expDisplayElement.textContent = `EXP ${p.current.toFixed(0)} / ${p.required}`;
      expFillElement.style.width = `${p.percentage}%`;
      requestAnimationFrame(() => animate(startTime));
    } else {
      const p = getExpProgress(finalExp);
      expDisplayElement.textContent = `EXP ${p.current.toFixed(0)} / ${p.required}`;
      expFillElement.style.width = `${p.percentage}%`;
      sfxProgressBar.pause();
      const bar = expFillElement.getBoundingClientRect();
      sparkAt(bar.right, bar.top + bar.height / 2, 8);
      const oldRank = getRankFromExp(initialExp);
      const newRank = getRankFromExp(finalExp);
      if (oldRank !== newRank) {
        const rankTitle = document.querySelector('#player-rank-container .player-rank-title');
        if (rankTitle) {
          rankTitle.classList.add('rank-out');
          setTimeout(() => {
            rankTitle.textContent = newRank;
            rankTitle.classList.remove('rank-out');
            rankTitle.classList.add('rank-in');
          }, 500);
        }
      }
    }
  };
  requestAnimationFrame((t) => animate(t));
}
