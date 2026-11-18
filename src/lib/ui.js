export function getRoot() {
  return document.getElementById('spa-root');
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// เปลี่ยนหน้าแบบมี Transition
// - เบราว์เซอร์ใหม่: ใช้ View Transitions (เฟดและเลื่อนขึ้นนุ่ม ๆ)
// - เบราว์เซอร์เก่า: เฟดออกแล้วเฟดเข้าเอง
export function playSlideTransition(cb) {
  // รองรับหน้าที่โหลดข้อมูลแบบ async: รอให้หน้าใหม่วาดเสร็จก่อนค่อยเล่น transition
  const run = async () => { await (cb && cb()); window.scrollTo(0, 0); };
  if (reduceMotion()) { run(); return; }

  if (document.startViewTransition) {
    document.startViewTransition(run);
    return;
  }
  const root = getRoot();
  if (!root) { run(); return; }
  root.classList.remove('page-enter');
  root.classList.add('page-leave');
  setTimeout(() => {
    root.classList.remove('page-leave');
    run();
    root.classList.add('page-enter');
    setTimeout(() => root.classList.remove('page-enter'), 450);
  }, 180);
}

// ไฮไลต์เมนูล่าง: 'home' | 'moon' | 'library' | 'grimoire' | 'none'
const NAV_ORDER = ['home', 'moon', 'library', 'grimoire'];
export function setNav(key) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  document.body.classList.remove('no-nav');
  nav.dataset.active = key;
  const index = NAV_ORDER.indexOf(key);
  if (index >= 0) nav.style.setProperty('--nav-index', index);
  nav.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === key));
}

export function hideNav() {
  document.body.classList.add('no-nav');
}

// ส่งข้อมูลการดูหน้าให้ Google Analytics (ถ้ามีติดตั้งไว้)
export function trackPageView(pagePath, pageTitle) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_title: pageTitle, page_path: pagePath });
  }
}
