import { cards } from '../data/cards.js';
import { loadPlayerData, savePlayerData, getRankFromExp, todayKey } from '../lib/player.js';
import { sfxPop, sfxSwipe, sfxCollect, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView, setNav } from '../lib/ui.js';
import { burstIn, haptic } from '../lib/fx.js';
import { showHome } from './home.js';

const APP_URL = 'https://my-familiars.netlify.app';
let countdownInterval = null;

function stopCountdown() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
}

function updateCountdownTimer() {
  const timerBox = document.getElementById('countdown-timer');
  if (!timerBox) { stopCountdown(); return; }
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const diff = tomorrow - now;
  timerBox.style.display = 'inline-block';
  if (diff <= 0) {
    timerBox.textContent = '🎉 สุ่มไพ่ใหม่ได้แล้ว!';
  } else {
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    timerBox.textContent = `🕒 ไพ่ใบใหม่ในอีก ${h} ชม. ${m} นาที ${s} วินาที`;
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
    return stored ? cards.find(c => c.name === stored.name) || null : null;
  } catch { return null; }
}

function ticks() {
  let s = '';
  for (let i = 0; i < 12; i++) s += `<i style="--a:${i * 30}deg;--delay:${(i * 0.13).toFixed(2)}s"></i>`;
  return s;
}

function floaters() {
  let s = '';
  for (let i = 0; i < 14; i++) {
    s += `<span class="float-spark" style="left:${8 + Math.random() * 84}%;top:${30 + Math.random() * 60}%;--size:${8 + Math.random() * 10}px;--d:${3 + Math.random() * 3}s;--delay:${-Math.random() * 5}s">✦</span>`;
  }
  return s;
}

export function showCardPage() {
  trackPageView('/card', 'Card Page');
  setNav('home');
  const root = getRoot();
  if (!root) return;

  const dailyCardData = readDailyCard();
  const today = todayKey();
  const playerData = loadPlayerData();
  const alreadyDrawn = playerData && playerData.lastCardDrawDate === today && dailyCardData;

  root.innerHTML = `
    <section class="ritual" id="ritual" data-step="${alreadyDrawn ? 'revealed' : 'summon'}">
      <div class="ritual-title"><small>MAGIC BOOKS &amp; CANDLE</small><h1>ไพ่ภูติประจำวัน</h1></div>
      <div class="ritual-glow"></div>
      <div class="rays"></div>
      <span class="ripple-ring"></span><span class="ripple-ring"></span><span class="ripple-ring"></span>
      <div class="fan">
        <div class="fan-card left"></div>
        <div class="fan-card right"></div>
        <div class="card-flip ${alreadyDrawn ? 'flipped' : ''}" id="flip-card">
          <div class="card-inner">
            <div class="card-front" id="card-front"></div>
            <div class="card-back"></div>
          </div>
        </div>
      </div>
      <div class="summon" id="summon" role="button" aria-label="เรียกไพ่">
        <div class="ticks">${ticks()}</div>
        <div class="gem"></div>
        <div class="core"></div>
      </div>
      <div class="ribbon"><h2 id="card-title"></h2></div>
      <div class="sparkle-layer" id="sparkle-layer">${floaters()}</div>
    </section>
    <p class="tap-hint" id="tap-hint">${alreadyDrawn ? '' : '✦ แตะเพชรเพื่อเรียกไพ่ ✦'}</p>

    <div class="window reading ${alreadyDrawn ? 'show' : ''}" id="reading">
      <p id="card-message"></p>
      <p id="card-advice" class="card-advice-text"></p>
    </div>
    <div class="center-wrapper"><p id="countdown-timer" class="countdown-timer" style="display:none;"></p></div>
    <div class="button-group">
      <button id="btn-back">กลับ</button>
      <button id="btn-share-facebook">แชร์ไพ่</button>
    </div>
  `;

  const ritual = document.getElementById('ritual');
  const flipCard = document.getElementById('flip-card');
  const hint = document.getElementById('tap-hint');
  let isDailyRewardGrantedOnFlip = false;

  const summon = () => {
    if (ritual.dataset.step !== 'summon') return;
    play(sfxPop);
    haptic(15);
    ritual.dataset.step = 'ready';
    hint.textContent = '✦ แตะไพ่เพื่อเปิดคำทำนาย ✦';
  };

  const reveal = () => {
    if (ritual.dataset.step !== 'ready') return;
    play(sfxSwipe);
    haptic([20, 40, 30]);

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
    ritual.dataset.step = 'revealed';
    flipCard.classList.add('flipped');
    hint.textContent = '';
    setTimeout(() => { burstIn(document.getElementById('sparkle-layer'), 40); play(sfxCollect); }, 450);
    document.getElementById('reading').classList.add('show');
    startCountdown();
  };

  if (alreadyDrawn) {
    showCard(dailyCardData);
    startCountdown();
  } else {
    document.getElementById('summon').addEventListener('click', summon);
    flipCard.addEventListener('click', reveal);
  }

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => {
      play(sfxPop);
      stopCountdown();
      playSlideTransition(() => showHome(isDailyRewardGrantedOnFlip));
    };
    document.getElementById('btn-share-facebook').onclick = () => {
      play(sfxPop);
      const cardToShare = readDailyCard();
      if (!cardToShare || ritual.dataset.step !== 'revealed') {
        hint.textContent = '✦ เปิดไพ่ก่อนแล้วค่อยแชร์นะ ✦';
        return;
      }
      const cardShareUrl = `${APP_URL}/.netlify/functions/share-card?name=${encodeURIComponent(cardToShare.name)}`;
      const shareText = `วันนี้ฉันได้ไพ่ "${cardToShare.name}" จาก My Familiars!`;
      if (navigator.share) {
        navigator.share({ title: 'ไพ่ประจำวันของฉัน - My Familiars', text: shareText, url: cardShareUrl }).catch(() => {});
      } else {
        const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardShareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fb, 'facebook-share-dialog', 'width=800,height=600,noopener');
      }
    };
  }, 30);
}
