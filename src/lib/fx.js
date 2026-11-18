// เอฟเฟกต์ทั้งแอป: พื้นหลังไล่สี, ดาว, ประกายตอนแตะ, การ์ดเอียงตามเมาส์, สั่นเบา ๆ
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const SPARK_CHARS = ['✦', '✧', '⋆', '✶', '·'];
const SPARK_COLORS = ['#ffc23d', '#ff5fa8', '#8b5cff', '#3fb8ff', '#c65cff'];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function buildBackdrop() {
  const aurora = document.createElement('div');
  aurora.className = 'aurora';
  const stars = document.createElement('div');
  stars.className = 'starfield';
  let html = '';
  for (let i = 0; i < 46; i++) {
    const big = i % 9 === 0;
    html += `<i class="${big ? 'big' : ''}" style="left:${rand(0, 100)}%;top:${rand(0, 100)}%;--s:${big ? 3 : rand(1, 2.4).toFixed(1)}px;--d:${rand(2.5, 6).toFixed(1)}s;--delay:${rand(-6, 0).toFixed(1)}s"></i>`;
  }
  stars.innerHTML = html;
  document.body.prepend(stars);
  document.body.prepend(aurora);
}

// ประกายดาวกระจายจากจุดที่แตะ
export function sparkAt(x, y, count = 7) {
  if (reduce()) return;
  const ring = document.createElement('span');
  ring.className = 'tap-ring';
  ring.style.left = `${x}px`; ring.style.top = `${y}px`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 600);
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'tap-spark';
    s.textContent = pick(SPARK_CHARS);
    const angle = (Math.PI * 2 * i) / count + rand(-.3, .3);
    const dist = rand(26, 52);
    s.style.left = `${x}px`; s.style.top = `${y}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    s.style.setProperty('--rot', `${rand(90, 270)}deg`);
    s.style.setProperty('--size', `${rand(12, 20)}px`);
    s.style.setProperty('--c', pick(SPARK_COLORS));
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 850);
  }
}

// ประกายดาวระเบิดใหญ่ (ใช้ตอนเปิดไพ่) ใส่ลงใน container ที่ให้มา
export function burstIn(container, count = 34) {
  if (!container || reduce()) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'burst';
    s.textContent = pick(SPARK_CHARS);
    const angle = rand(0, Math.PI * 2);
    const dist = rand(90, 220);
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    s.style.setProperty('--rot', `${rand(-360, 360)}deg`);
    s.style.setProperty('--size', `${rand(10, 26)}px`);
    s.style.setProperty('--c', pick(SPARK_COLORS));
    s.style.setProperty('--delay', `${rand(0, .25)}s`);
    container.appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
}

export function haptic(ms = 8) {
  try { navigator.vibrate?.(ms); } catch { /* ไม่รองรับ */ }
}

const TAPPABLE = 'button, a, [role="button"], .arch, .quest, .lore-card, .herb-card, .herb-planet, .collection-card, .collection-category-box, .lib-item, .question-log-item, .moon-cal-cell, .card-flip, .summon, .sky-card';

function setupTapFeedback() {
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(TAPPABLE);
    if (!target || target.disabled) return;
    sparkAt(e.clientX, e.clientY, target.closest('.summon, .card-flip') ? 0 : 7);
    haptic();
  }, { passive: true });
}

// การ์ดเอียงตามตำแหน่งเมาส์ (เฉพาะอุปกรณ์ที่มีเมาส์)
function setupTilt() {
  if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest('.tilt, .arch');
    document.querySelectorAll('.tilt-active').forEach(o => {
      if (o !== el) { o.classList.remove('tilt-active'); o.style.setProperty('--rx', '0deg'); o.style.setProperty('--ry', '0deg'); }
    });
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    el.classList.add('tilt-active');
    el.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-py * 12).toFixed(2)}deg`);
  }, { passive: true });
}

export function setupFx() {
  buildBackdrop();
  setupTapFeedback();
  setupTilt();
}
