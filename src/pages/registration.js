import { savePlayerData, getRankFromExp } from '../lib/player.js';
import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition } from '../lib/ui.js';
import { showHome } from './home.js';

export function showRegistrationPage() {
  const root = getRoot();
  if (!root) return;
  root.innerHTML = `
    <div class="window registration-window">
      <h1>ยินดีต้อนรับสู่โลกเวทมนตร์!</h1>
      <p>ก่อนจะเริ่มการเดินทาง โปรดตั้งชื่อของคุณ</p>
      <input type="text" id="username-input" placeholder="ใส่ชื่อของคุณที่นี่..." maxlength="20">
      <div class="registration-notice">
        <span class="notice-icon">⚠️</span>
        <span class="notice-text">ตั้งชื่อได้ครั้งเดียว เลือกดี ๆ น้า</span>
      </div>
      <button id="start-journey-button" class="button">เริ่มต้นการเดินทาง</button>
    </div>
  `;
  const usernameInput = document.getElementById('username-input');
  document.getElementById('start-journey-button').addEventListener('click', () => {
    const username = usernameInput.value.trim().slice(0, 20);
    if (!username) {
      alert('กรุณาตั้งชื่อก่อนเริ่มการเดินทาง');
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
  });
}
