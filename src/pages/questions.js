import { loadPlayerData, savePlayerData, getRankFromExp, todayKey } from '../lib/player.js';
import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { showHome } from './home.js';

let cachedQuestions = [];

export async function loadQuestions(fresh = false) {
  if (cachedQuestions.length && !fresh) return cachedQuestions;
  const res = await fetch('/questions.json' + (fresh ? '?v=' + Date.now() : ''));
  cachedQuestions = await res.json();
  return cachedQuestions;
}

export function getQuestionsCache() {
  return cachedQuestions;
}

const cleanExplanation = (text) => String(text || '').replace(/^[A-Z]\) /, '');

function backToHome() {
  document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showHome); };
}

export async function showDailyQuestionPage() {
  const root = getRoot();
  if (!root) return;

  const playerData = loadPlayerData();
  const answeredIndexes = (playerData.answeredQuestions || []).map(q => q.index);
  const today = todayKey();
  const questions = await loadQuestions(true);

  let randomIndex;
  if (playerData.todaysQuestion && playerData.todaysQuestion.date === today) {
    randomIndex = playerData.todaysQuestion.index;
  } else {
    const available = questions.map((_, i) => i).filter(i => !answeredIndexes.includes(i));
    if (available.length === 0) {
      root.innerHTML = `
        <div class="window daily-question-menu-box">
          <h2>สุดยอดไปเลย!</h2>
          <p>คุณตอบคำถามรายวันครบทุกข้อแล้ว<br>พบกันใหม่ในคำถามชุดถัดไปนะคะ ✨</p>
        </div>
        <div class="button-group"><button id="btn-back"> กลับ</button></div>
      `;
      setTimeout(backToHome, 30);
      return;
    }
    randomIndex = available[Math.floor(Math.random() * available.length)];
    playerData.todaysQuestion = { date: today, index: randomIndex };
    savePlayerData(playerData);
  }

  const q = questions[randomIndex];
  root.innerHTML = `
    <div class="window daily-question-menu-box">
      <h2>คำถามรายวัน</h2>
      <p class="daily-question-title">${escapeHtml(q.question)}</p>
      <div class="daily-choices-container">
        <button class="daily-choice-btn" id="choiceA">${escapeHtml(q.choices[0])}</button>
        <button class="daily-choice-btn" id="choiceB">${escapeHtml(q.choices[1])}</button>
      </div>
      <div id="daily-explanation" class="daily-explanation-box"></div>
    </div>
    <div class="button-group"><button id="btn-back"> กลับ</button></div>
  `;

  setTimeout(() => document.querySelector('.daily-question-menu-box')?.classList.add('fade-in-question'), 30);

  setTimeout(() => {
    backToHome();
    const a = document.getElementById('choiceA');
    const b = document.getElementById('choiceB');
    if (
      playerData.lastQuestionAnsweredDate === today &&
      playerData.lastQuestionResult &&
      playerData.todaysQuestion &&
      playerData.todaysQuestion.index === randomIndex
    ) {
      showExplanation(playerData.lastQuestionResult.correct, playerData.lastQuestionResult.answer, q);
      a.disabled = true;
      b.disabled = true;
    } else {
      a.disabled = false;
      b.disabled = false;
      a.onclick = () => handleDailyAnswer('A', q, randomIndex);
      b.onclick = () => handleDailyAnswer('B', q, randomIndex);
    }
  }, 20);
}

function showExplanation(isCorrect, choice, question) {
  const div = document.getElementById('daily-explanation');
  if (!div) return;
  const btn = document.getElementById(choice === 'A' ? 'choiceA' : 'choiceB');
  btn?.classList.add(isCorrect ? 'correct' : 'incorrect');
  div.innerHTML = `
    <div class="explanation-inner">
      ${isCorrect
        ? `<p style="color:green;">✅ ตอบถูก! ได้รับ EXP +25</p><p>${escapeHtml(cleanExplanation(question.explanation))}</p>`
        : `<p style="color:red;">❌ ตอบผิด<br>กลับมาตอบใหม่ได้วันถัดไป!</p>`}
    </div>`;
  div.classList.add('fade-in-explanation');
}

function handleDailyAnswer(choice, question, index) {
  play(sfxPop);
  const playerData = loadPlayerData();
  const today = todayKey();
  const isCorrect = choice === question.answer;

  // กันกดตอบซ้ำในวันเดียวกัน
  if (playerData.lastQuestionAnsweredDate === today && playerData.todaysQuestion?.index === index) return;

  playerData.lastQuestionAnsweredDate = today;
  playerData.lastQuestionResult = { answer: choice, correct: isCorrect, index };
  playerData.todaysQuestion = { date: today, index };

  if (isCorrect) {
    playerData.answeredQuestions = playerData.answeredQuestions || [];
    if (!playerData.answeredQuestions.some(q => q.index === index)) {
      playerData.answeredQuestions.push({ index, choice });
    }
    playerData.exp = (playerData.exp || 0) + 25;
    playerData.rank = getRankFromExp(playerData.exp);
    sessionStorage.setItem('triggerExpAnimation', 'true');
  }
  savePlayerData(playerData);

  setTimeout(() => {
    document.getElementById('choiceA').disabled = true;
    document.getElementById('choiceB').disabled = true;
  }, 100);
  showExplanation(isCorrect, choice, question);
}
