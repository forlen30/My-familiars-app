import { loadPlayerData, savePlayerData, getRankFromExp, getExpProgress } from '../lib/player.js';
import { sfxPop, sfxCollect, sfxProgressBar, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { isCloudEnabled } from '../lib/supabase.js';
import { getMoonToday } from '../lib/astro.js';
import { showRegistrationPage } from './registration.js';
import { showCardPage } from './card.js';
import { showDailyQuestionPage } from './questions.js';
import { showHerbPage } from './herbs.js';
import { showCollectionHubPage } from './collection.js';
import { showSupporterPage } from './supporters.js';
import { showMoonPage } from './moon.js';
import { showWheelPage } from './wheel.js';
import { showLibraryPage } from './library.js';
import { showAccountPage } from './account.js';

let lastKnownExp = 0;

export function showHome(triggerCollectionAnimation = false) {
  const playerData = loadPlayerData();
  if (!playerData) {
    showRegistrationPage();
    return;
  }

  const triggerExpAnimation = sessionStorage.getItem('triggerExpAnimation') === 'true';
  if (triggerExpAnimation) sessionStorage.removeItem('triggerExpAnimation');

  const newBadgeHtml = !playerData.hasSeenDailyQuestion ? '<span class="new-badge">ใหม่!</span>' : '';

  const initialExpForDisplay = (triggerCollectionAnimation || triggerExpAnimation) ? lastKnownExp : playerData.exp;
  lastKnownExp = playerData.exp;

  trackPageView('/', 'Home Page');
  const expProgress = getExpProgress(initialExpForDisplay);
  const root = getRoot();
  if (!root) return;

  const moon = getMoonToday();

  root.innerHTML = `
    <div class="player-profile-box">
      <div id="player-rank-container">
        <div class="player-rank-title">Ranking : ${escapeHtml(playerData.rank)}</div>
      </div>
      <div class="player-username">${escapeHtml(playerData.username)}</div>
      <div class="exp-bar-container">
        <div class="exp-bar-fill" style="width: ${expProgress.percentage}%;"></div>
        <span class="exp-text">EXP: ${expProgress.current} / ${expProgress.required}</span>
      </div>
      <button id="collection-button" class="button collection-btn">📖 กรีมัวร์ของฉัน</button>
    </div>
    <div class="window menu-box">
      <h1>นุ่มฟู ออราเคิล</h1>
      <p>สุ่มไพ่พยากรณ์ประจำวันของคุณ</p>
      <button class="button" id="btn-draw">คลิกเพื่อเริ่มสุ่มไพ่</button>
      <img src="/images/card-in-box.png" class="card-in-box" alt="สุ่มไพ่รายวัน" />
    </div>
    <div class="daily-question-box">
      <h1>ภารกิจคำถามรายวัน</h1>
      <p>คุณรู้เรื่องเวทมนตร์ดีแค่ไหน? มาทดสอบกัน!</p>
      <button class="button" id="btn-daily-question">คลิกเพื่อตอบคำถาม</button>
      <img src="/images/question-icon.png" class="question-icon" alt="คำถามรายวัน" />
    </div>
    <div class="encyclopedia-box">
      ${newBadgeHtml}
      <h1>สารานุกรม สมุนไพรเวท</h1>
      <p>แหล่งรวมข้อมูล สมุนไพรเวทอยู่ที่นี้แล้ว!</p>
      <button class="button" id="btn-herb">คลิกเพื่อสำรวจสมุนไพรเวท</button>
      <img src="/images/leaf.png" class="herb-leaf" alt="" />
    </div>
    <div class="feature-box clickable-box" id="moon-box" tabindex="0">
      <span class="new-badge">ใหม่!</span>
      <div class="feature-moon-emoji" aria-hidden="true">${moon.emoji}</div>
      <strong>ปฏิทินจันทร์</strong>
      <span>คืนนี้: ${moon.nameTh} · สว่าง ${moon.illuminationPct}%</span>
    </div>
    <div class="wheel-box menu-box clickable-box" id="wheel-box" tabindex="0">
      <span class="new-badge">ใหม่!</span>
      <strong>กงล้อแห่งปี</strong>
      <span>วันสะบัตทั้ง 8 ของปี</span>
      <img src="/images/wheel-of-the-year.png" class="wheel-of-the-year" alt="กงล้อแห่งปี" />
    </div>
    <div class="feature-box clickable-box" id="library-box" tabindex="0">
      <span class="new-badge">ใหม่!</span>
      <div class="feature-moon-emoji" aria-hidden="true">🕯️</div>
      <strong>คลังความรู้ Magic Books &amp; Candle</strong>
      <span>บทความสายเวทที่สะสมมาตลอดหลายปี</span>
    </div>
    <div class="my-familiars menu-box clickable-box" tabindex="0">
      <strong>ภูติรับใช้</strong>
      <span style="font-size:1em;color:#8ec9ff;">Coming Soon ...</span>
      <img src="/images/egg.png" class="egg" alt="ภูติรับใช้" />
    </div>
    ${isCloudEnabled ? `
    <div class="feature-box clickable-box" id="account-box" tabindex="0">
      <div class="feature-moon-emoji" aria-hidden="true">🔮</div>
      <strong>บัญชีของฉัน</strong>
      <span>เข้าสู่ระบบ · สมาชิกพรีเมียม</span>
    </div>` : ''}
    <div class="supporter-box menu-box clickable-box" id="supporter-box">
      <strong>ผู้สนับสนุนของเรา</strong><br>
      <span>กดเพื่อดูรายชื่อ</span>
      <img src="/images/love.png" class="love" alt="รัก" />
    </div>
  `;

  window.scrollTo(0, 0);

  setTimeout(() => {
    const go = (id, page) => {
      const el = document.getElementById(id);
      if (el) el.onclick = () => { play(sfxPop); playSlideTransition(page); };
    };
    go('btn-draw', showCardPage);
    go('btn-daily-question', showDailyQuestionPage);
    go('supporter-box', showSupporterPage);
    go('btn-herb', showHerbPage);
    go('moon-box', showMoonPage);
    go('wheel-box', showWheelPage);
    go('library-box', showLibraryPage);
    go('account-box', showAccountPage);
    const collectionButton = document.getElementById('collection-button');
    collectionButton.onclick = () => { play(sfxPop); playSlideTransition(showCollectionHubPage); };

    if (!playerData.hasSeenDailyQuestion) {
      document.getElementById('btn-herb')?.classList.add('light-sweep-effect');
      playerData.hasSeenDailyQuestion = true;
      savePlayerData(playerData);
    }

    if (triggerCollectionAnimation) {
      setTimeout(() => {
        const rect = collectionButton.getBoundingClientRect();
        const flyingCard = document.createElement('div');
        flyingCard.className = 'flying-card';
        flyingCard.style.setProperty('--start-y', `${window.innerHeight / 2}px`);
        flyingCard.style.setProperty('--start-x', `${window.innerWidth / 2}px`);
        flyingCard.style.setProperty('--target-y', `${rect.top + rect.height / 2}px`);
        flyingCard.style.setProperty('--target-x', `${rect.left + rect.width / 2}px`);
        document.body.appendChild(flyingCard);

        setTimeout(() => {
          flyingCard.remove();
          collectionButton.classList.add('pop-effect');
          play(sfxCollect);
          setTimeout(() => {
            collectionButton.classList.remove('pop-effect');
            if (playerData.exp > initialExpForDisplay) playExpBarAnimation(playerData, initialExpForDisplay);
          }, 400);
        }, 1500);
      }, 800);
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
      expDisplayElement.textContent = `EXP: ${p.current.toFixed(0)} / ${p.required}`;
      expFillElement.style.width = `${p.percentage}%`;
      requestAnimationFrame(() => animate(startTime));
    } else {
      const p = getExpProgress(finalExp);
      expDisplayElement.textContent = `EXP: ${p.current.toFixed(0)} / ${p.required}`;
      expFillElement.style.width = `${p.percentage}%`;
      sfxProgressBar.pause();

      const oldRank = getRankFromExp(initialExp);
      const newRank = getRankFromExp(finalExp);
      if (oldRank !== newRank) {
        const rankTitle = document.querySelector('#player-rank-container .player-rank-title');
        if (rankTitle) {
          rankTitle.classList.add('rank-out');
          setTimeout(() => {
            rankTitle.textContent = `Ranking : ${newRank}`;
            rankTitle.classList.remove('rank-out');
            rankTitle.classList.add('rank-in');
          }, 500);
        }
      }
    }
  };
  requestAnimationFrame((t) => animate(t));
}
