// คลังความรู้: บทความจากเพจ Magic Books & Candle
// - ถ้าตั้ง Supabase แล้ว: อ่านจากตาราง articles (รองรับบทความพรีเมียม)
// - ถ้ายังไม่ตั้ง: อ่านจากไฟล์ public/data/articles.json ที่สร้างจากสคริปต์นำเข้าข้อมูลเพจ
import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { supabase, isCloudEnabled } from '../lib/supabase.js';
import { showHome } from './home.js';

const PAGE_SIZE = 20;
let state = { category: 'all', query: '', page: 0 };
let staticCache = null;

async function loadStatic() {
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
  if (isCloudEnabled) {
    let q = supabase.from('articles')
      .select('id,title,excerpt,category,published_at,is_premium', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (category !== 'all') q = q.eq('category', category);
    if (query) q = q.ilike('title', `%${query.replace(/[%_]/g, '')}%`);
    const { data, count, error } = await q;
    const { data: cats } = await supabase.from('article_categories').select('category');
    if (!error) return { articles: data || [], total: count || 0, categories: (cats || []).map(c => c.category) };
  }
  const data = await loadStatic();
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

async function fetchArticle(id) {
  if (isCloudEnabled) {
    // ข้อมูลหัวเรื่องอ่านได้ทุกคน ส่วนเนื้อหา (article_bodies) ถูกกันด้วย RLS ถ้าเป็นบทความพรีเมียม
    const { data: meta } = await supabase.from('articles')
      .select('id,title,category,published_at,is_premium,source_url').eq('id', id).maybeSingle();
    if (!meta) return null;
    const { data: body } = await supabase.from('article_bodies')
      .select('body,image_url').eq('article_id', id).maybeSingle();
    if (!body) return meta.is_premium ? { locked: true } : { ...meta, body: '' };
    return { ...meta, ...body };
  }
  const data = await loadStatic();
  return data.articles.find(a => String(a.id) === String(id)) || null;
}

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export async function showLibraryPage() {
  trackPageView('/library', 'Library');
  const root = getRoot();
  if (!root) return;
  window.scrollTo(0, 0);

  root.innerHTML = `<div class="window"><h2>คลังความรู้</h2><p>กำลังโหลด...</p></div>`;
  const { articles, total, categories } = await fetchArticles();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const empty = total === 0 && !state.query && state.category === 'all';

  root.innerHTML = `
    <div class="window library-page">
      <h2>คลังความรู้</h2>
      ${empty ? `<p>กำลังรวบรวมบทความจากเพจ Magic Books &amp; Candle<br>เร็ว ๆ นี้ ✨</p>` : `
      <input type="search" id="lib-search" placeholder="ค้นหาบทความ..." value="${escapeHtml(state.query)}" maxlength="60">
      <div class="lib-cats">
        <button class="lib-cat ${state.category === 'all' ? 'active' : ''}" data-cat="all">ทั้งหมด</button>
        ${categories.map(c => `<button class="lib-cat ${state.category === c ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
      </div>
      <ul class="lib-list">
        ${articles.map(a => `
          <li class="lib-item" data-id="${escapeHtml(a.id)}">
            <div class="lib-item-title">${a.is_premium ? '🌟 ' : ''}${escapeHtml(a.title)}</div>
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

  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => {
      play(sfxPop);
      state = { category: 'all', query: '', page: 0 };
      playSlideTransition(showHome);
    };
    const search = document.getElementById('lib-search');
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
      li.onclick = () => { play(sfxPop); showArticle(li.dataset.id); };
    });
    const prev = document.getElementById('lib-prev');
    const next = document.getElementById('lib-next');
    if (prev) prev.onclick = () => { state.page--; showLibraryPage(); };
    if (next) next.onclick = () => { state.page++; showLibraryPage(); };
  }, 30);
}

async function showArticle(id) {
  const root = getRoot();
  window.scrollTo(0, 0);
  const a = await fetchArticle(id);

  let content;
  if (!a) content = '<p>ไม่พบบทความ</p>';
  else if (a.locked) content = '<h2>🌟 บทความพิเศษ</h2><p>บทความนี้สำหรับสมาชิกพรีเมียม</p>';
  else {
    // แสดงเนื้อหาเป็นข้อความล้วน (ไม่รัน HTML จากฐานข้อมูล) และแปลงขึ้นบรรทัดใหม่
    const body = escapeHtml(a.body || '').replace(/\n/g, '<br>');
    content = `
      <h2>${escapeHtml(a.title)}</h2>
      <div class="lib-item-meta">${escapeHtml(a.category || '')} · ${fmtDate(a.published_at)}</div>
      ${a.image_url && /^(https:\/\/|\/)/.test(a.image_url) ? `<img class="lib-article-img" src="${escapeHtml(a.image_url)}" alt="" loading="lazy">` : ''}
      <div class="lib-article-body">${body}</div>
      ${a.source_url && /^https:\/\/(www\.)?facebook\.com\//.test(a.source_url)
        ? `<p class="lib-source"><a href="${escapeHtml(a.source_url)}" target="_blank" rel="noopener noreferrer">ดูโพสต์ต้นฉบับพร้อมรูปบน Facebook</a></p>` : ''}`;
  }

  root.innerHTML = `
    <div class="window library-article">${content}</div>
    <div class="button-group"><button id="btn-back">กลับ</button></div>`;
  setTimeout(() => {
    document.getElementById('btn-back').onclick = () => { play(sfxPop); showLibraryPage(); };
  }, 30);
}
