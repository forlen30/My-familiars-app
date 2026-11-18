// คลังความรู้: บทความจากเพจ Magic Books & Candle
// อ่านจากไฟล์ public/data/articles.json ที่สร้างจากสคริปต์นำเข้าข้อมูลเพจ (ไม่มีค่าใช้จ่าย ไม่ต้องมีฐานข้อมูล)
import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView, setNav } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { showHome } from './home.js';

const PAGE_SIZE = 20;
let state = { category: 'all', query: '', page: 0 };
let staticCache = null;

async function loadData() {
  if (staticCache) return staticCache;
  try {
    const res = await fetch('/data/articles.json');
    staticCache = res.ok ? await res.json() : { categories: [], articles: [] };
  } catch {
    staticCache = { categories: [], articles: [] };
  }
  return staticCache;
}

async function fetchArticles() {
  const { category, query, page } = state;
  const data = await loadData();
  let list = data.articles;
  if (category !== 'all') list = list.filter(a => a.category === category);
  if (query) {
    const ql = query.toLowerCase();
    list = list.filter(a => a.title.toLowerCase().includes(ql) || (a.body || '').toLowerCase().includes(ql));
  }
  return {
    articles: list.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    total: list.length,
    categories: data.categories
  };
}

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export async function showLibraryPage() {
  trackPageView('/library', 'Library');
  setNav('library');
  const root = getRoot();
  if (!root) return;

  const { articles, total, categories } = await fetchArticles();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const empty = total === 0 && !state.query && state.category === 'all';

  root.innerHTML = `
    <div class="window library-page reveal">
      <h2>คลังความรู้</h2>
      ${empty ? `<p>กำลังรวบรวมบทความจากเพจ Magic Books &amp; Candle<br>เร็ว ๆ นี้ ✨</p>` : `
      <input type="search" id="lib-search" placeholder="ค้นหาบทความ..." value="${escapeHtml(state.query)}" maxlength="60">
      <div class="lib-cats">
        <button class="lib-cat ${state.category === 'all' ? 'active' : ''}" data-cat="all">ทั้งหมด</button>
        ${categories.map(c => `<button class="lib-cat ${state.category === c ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
      </div>
      <ul class="lib-list">
        ${articles.map((a, i) => `
          <li class="lib-item" style="--i:${i}" data-id="${escapeHtml(a.id)}">
            <div class="lib-item-title">${escapeHtml(a.title)}</div>
            <div class="lib-item-meta">${escapeHtml(a.category || '')} · ${fmtDate(a.published_at)}</div>
          </li>`).join('') || '<li class="lib-empty">ไม่พบบทความ</li>'}
      </ul>
      <div class="pagination-controls" ${pages <= 1 ? 'style="display:none"' : ''}>
        <button id="lib-prev" class="${state.page === 0 ? 'hidden' : ''}">ก่อนหน้า</button>
        <span class="page-info">หน้า ${state.page + 1} / ${pages}</span>
        <button id="lib-next" class="${state.page + 1 >= pages ? 'hidden' : ''}">ถัดไป</button>
      </div>`}
    </div>
    <div class="button-group"><button id="btn-back">กลับ</button></div>
  `;

  const search = document.getElementById('lib-search');
  if (search && state.query) {
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  }

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => {
      play(sfxPop);
      state = { category: 'all', query: '', page: 0 };
      playSlideTransition(showHome);
    };
    if (search) {
      let t;
      search.oninput = () => {
        clearTimeout(t);
        t = setTimeout(() => { state.query = search.value.trim(); state.page = 0; showLibraryPage(); }, 400);
      };
    }
    document.querySelectorAll('.lib-cat').forEach(b => {
      b.onclick = () => { play(sfxPop); state.category = b.dataset.cat; state.page = 0; showLibraryPage(); };
    });
    document.querySelectorAll('.lib-item').forEach(li => {
      li.onclick = () => { play(sfxPop); playSlideTransition(() => showArticle(li.dataset.id)); };
    });
    const prev = document.getElementById('lib-prev');
    const next = document.getElementById('lib-next');
    if (prev) prev.onclick = () => { state.page--; playSlideTransition(showLibraryPage); };
    if (next) next.onclick = () => { state.page++; playSlideTransition(showLibraryPage); };
  }, 30);
}

// เกร็ดประจำวัน: เลือกบทความ 1 เรื่องต่อวัน (ทุกคนเห็นเรื่องเดียวกันในวันเดียวกัน) ไม่รวมโพสต์ขายของ
export async function getDailyArticle() {
  const data = await loadData();
  const pool = data.articles.filter(a => a.category !== 'ข่าวสารและสินค้า' && (a.body || '').length > 300);
  if (!pool.length) return null;
  const d = new Date();
  const seed = d.getFullYear() * 1000 + Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return pool[(seed * 2654435761 >>> 0) % pool.length];
}

export async function showArticle(id, backTo = showLibraryPage) {
  const root = getRoot();
  const data = await loadData();
  const a = data.articles.find(x => String(x.id) === String(id));

  let content = '<p>ไม่พบบทความ</p>';
  if (a) {
    // แสดงเนื้อหาเป็นข้อความล้วน (ไม่รัน HTML จากไฟล์ข้อมูล) และแปลงขึ้นบรรทัดใหม่
    const body = escapeHtml(a.body || '').replace(/\n/g, '<br>');
    content = `
      <div class="lib-item-meta">${escapeHtml(a.category || '')} · ${fmtDate(a.published_at)}</div>
      <h2>${escapeHtml(a.title)}</h2>
      ${a.image_url && /^(https:\/\/|\/)/.test(a.image_url) ? `<img class="lib-article-img" src="${escapeHtml(a.image_url)}" alt="" loading="lazy">` : ''}
      <div class="lib-article-body">${body}</div>
      ${a.source_url && /^https:\/\/(www\.)?facebook\.com\//.test(a.source_url)
        ? `<p class="lib-source"><a href="${escapeHtml(a.source_url)}" target="_blank" rel="noopener noreferrer">ดูโพสต์ต้นฉบับพร้อมรูปบน Facebook</a></p>` : ''}`;
  }

  root.innerHTML = `
    <div class="window library-article reveal">${content}</div>
    <div class="button-group"><button id="btn-back">กลับ</button></div>`;
  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(backTo); };
  }, 30);
}
