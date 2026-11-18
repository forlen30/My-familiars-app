import { cards } from '../data/cards.js';
import { loadPlayerData, savePlayerData, getRankFromExp, todayKey } from '../lib/player.js';
import { sfxPop, sfxSwipe, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView } from '../lib/ui.js';
import { showHome } from './home.js';

const APP_URL = 'https://my-familiars.netlify.app';
let countdownInterval = null;

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function updateCountdownTimer() {
  const timerBox = document.getElementById('countdown-timer');
  const backButton = document.getElementById('btn-back');
  if (!timerBox || !backButton) {
    stopCountdown();
    return;
  }
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const diff = tomorrow - now;

  if (diff <= 0) {
    timerBox.innerHTML = `🎉 <span style="color:#4caf50;">คุณสามารถสุ่มใหม่ได้แล้ว!</span>`;
  } else {
    timerBox.style.display = 'inline-block';
    backButton.style.display = 'inline-block';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    timerBox.innerHTML = `🕒 <span style="color:#444;">พร้อมสุ่มใหม่ในอีก <b>${hours}</b> ชั่วโมง <b>${minutes}</b> นาที <b>${seconds}</b> วินาที</span>`;
  }
}

function startCountdown() {
  stopCountdown();
  countdownInterval = setInterval(updateCountdownTimer, 1000);
  updateCountdownTimer();
}

function showCard(card) {
  document.getElementById('card-front').style.backgroundImage = `url(/${card.image})`;
  document.getElementById('card-title').textContent = card.name;
  document.getElementById('card-message').textContent = card.message;
  const adviceBox = document.getElementById('card-advice');
  adviceBox.textContent = '';
  if (card.advice) {
    const label = 'คำแนะนำสำหรับวันนี้:';
    const strong = document.createElement('strong');
    strong.textContent = label;
    adviceBox.append(strong, card.advice.replace(label, ''));
  }
}

function readDailyCard() {
  try {
    const stored = JSON.parse(localStorage.getItem('dailyCard'));
    // อ่านจากชุดไพ่ในแอปเสมอ (กันข้อมูลใน localStorage ถูกแก้)
    return stored ? cards.find(c => c.name === stored.name) || null : null;
  } catch {
    return null;
  }
}

export function showCardPage() {
  trackPageView('/card', 'Card Page');
  const root = getRoot();
  if (!root) return;
  root.innerHTML = `
    <div class="window">
      <h1>ไพ่ของคุณ คือ</h1>
      <div class="card-flip" id="flip-card">
        <div class="card-inner">
          <div class="card-front" id="card-front"></div>
          <div class="card-back"></div>
        </div>
      </div>
      <h2 id="card-title"></h2>
      <p id="card-message"></p>
      <p id="card-advice" class="card-advice-text"></p>
    </div>
    <div class="center-wrapper"><p id="countdown-timer" class="countdown-timer cute-timer" style="display:none;"></p></div>
    <div class="button-group"><button id="btn-back"> กลับ</button>
    <button id="btn-share-facebook">แชร์</button> </div>
  `;

  const flipCard = document.getElementById('flip-card');
  const dailyCardData = readDailyCard();
  const today = todayKey();
  const playerData = loadPlayerData();
  let isDailyRewardGrantedOnFlip = false;

  const handleCardFlip = () => {
    play(sfxSwipe);
    flipCard.classList.add('flipped');

    const current = loadPlayerData();
    if (current.lastCardDrawDate !== today) {
      current.exp += 25;
      current.rank = getRankFromExp(current.exp);
      current.lastCardDrawDate = today;
      isDailyRewardGrantedOnFlip = true;
    }

    const card = cards[Math.floor(Math.random() * cards.length)];
    localStorage.setItem('dailyCard', JSON.stringify(card));
    if (!current.collectedCards.includes(card.name)) current.collectedCards.push(card.name);
    savePlayerData(current);

    showCard(card);
    flipCard.style.pointerEvents = 'none';
    flipCard.removeEventListener('click', handleCardFlip);
    startCountdown();
  };

  if (playerData && playerData.lastCardDrawDate === today && dailyCardData) {
    flipCard.classList.add('flipped');
    showCard(dailyCardData);
    flipCard.style.pointerEvents = 'none';
    startCountdown();
  } else {
    flipCard.addEventListener('click', handleCardFlip);
    flipCard.style.pointerEvents = 'auto';
  }

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => {
      play(sfxPop);
      stopCountdown();
      playSlideTransition(() => showHome(isDailyRewardGrantedOnFlip));
    };
    const shareButton = document.getElementById('btn-share-facebook');
    if (shareButton) {
      shareButton.onclick = () => {
        play(sfxPop);
        const cardToShare = readDailyCard();
        if (!cardToShare) return alert('ไม่พบข้อมูลการ์ดที่จะแชร์ครับ');

        const cardShareUrl = `${APP_URL}/.netlify/functions/share-card?name=${encodeURIComponent(cardToShare.name)}`;
        const shareText = `วันนี้ฉันได้ไพ่ "${cardToShare.name}" จาก My Familiars!`;

        if (navigator.share) {
          navigator.share({ title: 'ไพ่ประจำวันของฉัน - My Familiars', text: shareText, url: cardShareUrl }).catch(() => {});
        } else {
          const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardShareUrl)}&quote=${encodeURIComponent(shareText)}`;
          window.open(fb, 'facebook-share-dialog', 'width=800,height=600,noopener');
        }
      };
    }
  }, 30);
}
