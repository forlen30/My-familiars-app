// จุดเริ่มต้นของแอป My Familiars
import './style.css';
import './features.css';
import { setupPwa } from './lib/pwa.js';
import { loadPlayerData, migratePlayerData } from './lib/player.js';
import { showHome } from './pages/home.js';
import { showRegistrationPage } from './pages/registration.js';

document.addEventListener('contextmenu', (e) => e.preventDefault());

function initializeApp() {
  const playerData = migratePlayerData(loadPlayerData());
  if (playerData) showHome();
  else showRegistrationPage();
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('touchend', (e) => {
    if (e.target.classList.contains('button') || e.target.tagName === 'BUTTON') e.target.blur();
  });
  initializeApp();
});

setupPwa();

// เมนูผู้พัฒนา: มีเฉพาะตอนพัฒนาในเครื่อง (npm run dev) ไม่ถูกรวมในเว็บจริง
// เพื่อกันผู้ใช้ทั่วไปเปิดเมนูแล้วเพิ่ม EXP ให้ตัวเอง
if (import.meta.env.DEV) {
  import('./debug.js').then(m => m.setupDebugMenu());
}
