import { savePlayerData, getRankFromExp } from '../lib/player.js';
import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, hideNav } from '../lib/ui.js';
import { showHome } from './home.js';

export function showRegistrationPage() {
  const root = getRoot();
  if (!root) return;
  hideNav();
  root.innerHTML = `
    <div class="window registration-window reveal">
      <div class="reg-hero" aria-hidden="true">
        <img src="/images/Cat.png" alt=""><img src="/images/card-back.png" alt=""><img src="/images/Frog.png" alt="">
      </div>
      <h1 class="title-sparkle">ยินดีต้อนรับ</h1>
      <p><strong>สู่โลกเวทมนตร์ของ Magic Books &amp; Candle</strong></p>
      <p>ก่อนจะเริ่มการเดินทาง โปรดตั้งชื่อของคุณ</p>
      <input type="text" id="username-input" placeholder="ใส่ชื่อของคุณที่นี่..." maxlength="20" autocomplete="nickname">
      <div class="registration-notice">
        <span aria-hidden="true">⚠️</span>
        <span>ตั้งชื่อได้ครั้งเดียว เลือกดี ๆ น้า</span>
      </div>
      <button id="start-journey-button" class="button">เริ่มต้นการเดินทาง</button>
    </div>
  `;
  const usernameInput = document.getElementById('username-input');
  const start = () => {
    const username = usernameInput.value.trim().slice(0, 20);
    if (!username) {
      usernameInput.focus();
      usernameInput.animate?.([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 250 });
      return;
    }
    savePlayerData({
      username,
      exp: 0,
      rank: getRankFromExp(0),
      collectedCards: [],
      answeredQuestions: [],
      lastCardDrawDate: null,
      lastQuestionAnsweredDate: null
    });
    play(sfxPop);
    playSlideTransition(showHome);
  };
  document.getElementById('start-journey-button').addEventListener('click', start);
  usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
}
