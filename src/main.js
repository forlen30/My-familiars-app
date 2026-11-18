// จุดเริ่มต้นของแอป My Familiars
import './styles/app.css';
import { setupPwa } from './lib/pwa.js';
import { setupFx } from './lib/fx.js';
import { loadPlayerData, migratePlayerData } from './lib/player.js';
import { playSlideTransition } from './lib/ui.js';
import { sfxPop, play } from './lib/sound.js';
import { showHome } from './pages/home.js';
import { showRegistrationPage } from './pages/registration.js';
import { showMoonPage } from './pages/moon.js';
import { showLibraryPage } from './pages/library.js';
import { showCollectionHubPage } from './pages/collection.js';

document.addEventListener('contextmenu', (e) => e.preventDefault());

const NAV_PAGES = {
  home: () => showHome(),
  moon: showMoonPage,
  library: showLibraryPage,
  grimoire: showCollectionHubPage
};

function setupBottomNav() {
  document.querySelectorAll('#bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!loadPlayerData()) return;
      const page = NAV_PAGES[btn.dataset.nav];
      if (!page) return;
      play(sfxPop);
      playSlideTransition(page);
    });
  });
}

function initializeApp() {
  const playerData = migratePlayerData(loadPlayerData());
  if (playerData) showHome();
  else showRegistrationPage();
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('touchend', (e) => {
    if (e.target.classList.contains('button') || e.target.tagName === 'BUTTON') e.target.blur();
  });
  setupFx();
  setupBottomNav();
  initializeApp();
});

setupPwa();

// เมนูผู้พัฒนา: มีเฉพาะตอนพัฒนาในเครื่อง (npm run dev) ไม่ถูกรวมในเว็บจริง
if (import.meta.env.DEV) {
  import('./debug.js').then(m => m.setupDebugMenu());
}
