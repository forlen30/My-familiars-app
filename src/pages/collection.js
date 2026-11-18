import { cards } from '../data/cards.js';
import { loadPlayerData } from '../lib/player.js';
import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView, setNav } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { loadQuestions, getQuestionsCache } from './questions.js';
import { showHome } from './home.js';

let currentPage = 1;
const CARDS_PER_PAGE = 4;

export async function showCollectionHubPage() {
  trackPageView('/collection-hub', 'Collection Hub');
  setNav('grimoire');
  const root = getRoot();
  const playerData = loadPlayerData();
  const questions = await loadQuestions().catch(() => getQuestionsCache());
  const collectedCount = playerData.collectedCards?.length || 0;
  const answeredCount = playerData.answeredQuestions?.length || 0;

  root.innerHTML = `
    <div class="window">
      <h1>กรีมัวร์ของฉัน</h1>
      <p>คลังรวบรวมทุกสิ่งที่คุณค้นพบในการเดินทาง</p>
      <div class="hub-grid">
        <div class="collection-category-box" id="hub-cards">
          <img src="/images/card-in-box.png" class="icon" alt="คอลเลคชันการ์ด" />
          <div class="details">
            <h3>คอลเลคชันการ์ด</h3>
            <p>สะสมแล้ว ${collectedCount} / ${cards.length} ใบ</p>
          </div>
        </div>
        <div class="collection-category-box" id="hub-questions">
          <img src="/images/question-icon.png" class="icon" alt="บันทึกคำถาม-คำตอบ" />
          <div class="details">
            <h3>บันทึกคำถาม-คำตอบ</h3>
            <p>ตอบแล้ว ${answeredCount} / ${questions.length} ข้อ</p>
          </div>
        </div>
      </div>
    </div>
    <div class="button-group"><button id="btn-back"> กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showHome); };
    document.getElementById('hub-cards').onclick = () => { play(sfxPop); playSlideTransition(showCardCollectionPage); };
    document.getElementById('hub-questions').onclick = () => { play(sfxPop); playSlideTransition(showQuestionCollectionPage); };
  }, 50);
}

async function showQuestionCollectionPage() {
  trackPageView('/question-collection', 'Question Collection');
  const root = getRoot();
  const playerData = loadPlayerData();
  const answered = playerData.answeredQuestions || [];
  const questions = await loadQuestions().catch(() => getQuestionsCache());

  const listHtml = answered.length === 0
    ? `<p style="text-align:center; color: #888;">ยังไม่มีคำถามที่ตอบ<br>ลองไปตอบคำถามรายวันดูสิ!</p>`
    : answered.map(item => {
        const q = questions[item.index];
        if (!q) return '';
        return `
          <div class="question-log-item" data-index="${Number(item.index)}">
            <div class="question-title">${escapeHtml(q.question)}</div>
            <div class="explanation-content">
              <p><strong>คำตอบของคุณ:</strong> ${escapeHtml(item.choice)}</p>
              <p><strong>คำอธิบาย:</strong> ${escapeHtml(String(q.explanation || '').replace(/^[A-Z]\) /, ''))}</p>
            </div>
          </div>`;
      }).join('');

  root.innerHTML = `
    <div class="window">
      <h1>บันทึกคำถาม-คำตอบ</h1>
      <div class="question-log-container">${listHtml}</div>
    </div>
    <div class="button-group"><button id="btn-back"> กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showCollectionHubPage); };
    document.querySelectorAll('.question-log-item').forEach(item => {
      item.addEventListener('click', () => { play(sfxPop); item.classList.toggle('open'); });
    });
  }, 50);
}

function showCardCollectionPage() {
  trackPageView('/collection', 'Card Collection');
  const root = getRoot();
  const playerData = loadPlayerData();
  const collected = playerData ? playerData.collectedCards : [];
  const totalPages = Math.ceil(collected.length / CARDS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
  else if (totalPages === 0) currentPage = 1;

  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const toShow = collected.slice(start, start + CARDS_PER_PAGE);

  const gridHtml = toShow.length === 0
    ? `<p class="empty-collection-text">ยังไม่มีการ์ดในคอลเลคชัน<br>ลองเปิดไพ่รายวันเพื่อเริ่มสะสมสิ!</p>`
    : toShow.map(name => {
        const c = cards.find(x => x.name === name);
        if (!c) return '';
        return `
          <div class="collection-card" data-card-name="${escapeHtml(c.name)}">
            <img src="/${c.image}" alt="${escapeHtml(c.name)}" loading="lazy">
            <span>${escapeHtml(c.name)}</span>
          </div>`;
      }).join('');

  root.innerHTML = `
    <div class="window">
      <h1>กรีมัวร์ของฉัน</h1>
      <p>การ์ดที่สะสมได้ทั้งหมด: ${collected.length} / ${cards.length} ใบ</p>
      <div class="collection-grid">${gridHtml}</div>
      <div class="pagination-controls" ${totalPages <= 1 ? 'style="display: none;"' : ''}>
        <button id="prev-page-btn" class="${currentPage === 1 ? 'hidden' : ''}">กลับ</button>
        <span class="page-info">หน้า ${currentPage} / ${totalPages > 0 ? totalPages : 1}</span>
        <button id="next-page-btn" class="${currentPage === totalPages || totalPages === 0 ? 'hidden' : ''}">ถัดไป</button>
      </div>
    </div>
    <div class="button-group"><button id="btn-back"> กลับ</button></div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showCollectionHubPage); };
    const prev = document.getElementById('prev-page-btn');
    const next = document.getElementById('next-page-btn');
    if (prev) prev.onclick = () => { if (currentPage > 1) { currentPage--; play(sfxPop); showCardCollectionPage(); } };
    if (next) next.onclick = () => { if (currentPage < totalPages) { currentPage++; play(sfxPop); showCardCollectionPage(); } };

    document.querySelector('.collection-grid').addEventListener('click', (event) => {
      const el = event.target.closest('.collection-card');
      if (!el) return;
      play(sfxPop);
      const c = cards.find(x => x.name === el.dataset.cardName);
      if (c) showCardDetailModal(c);
    });
  }, 50);
}

function showCardDetailModal(card) {
  const modal = document.createElement('div');
  modal.className = 'modal-container';
  const label = 'คำแนะนำสำหรับวันนี้:';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <img src="/${card.image}" alt="${escapeHtml(card.name)}">
      <h2>${escapeHtml(card.name)}</h2>
      <p class="modal-message">${escapeHtml(card.message)}</p>
      <div class="modal-advice-container">
        <p class="modal-advice"><strong>${label}</strong>${escapeHtml(card.advice.replace(label, ''))}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => { modal.remove(); document.body.style.overflow = 'auto'; };
  modal.querySelector('.modal-close').onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };
}
