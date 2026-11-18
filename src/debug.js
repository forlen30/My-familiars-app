// เมนูผู้พัฒนา (โหลดเฉพาะตอน npm run dev)
// เปิดเมนู: คลิกข้อความด้านล่างสุดของแอป 15 ครั้งภายใน 2 วินาที
import { loadPlayerData, savePlayerData, getRankFromExp, todayKey } from './lib/player.js';

export function setupDebugMenu() {
  const menu = document.createElement('div');
  menu.id = 'debug-menu';
  menu.style.cssText = 'display:none;position:fixed;bottom:10px;right:10px;background:rgba(0,0,0,0.7);color:white;padding:15px;border-radius:10px;z-index:10001;font-family:Itim,sans-serif;';
  menu.innerHTML = `
    <h4 style="margin:0 0 10px 0;text-align:center;color:#ffab40;">เมนูผู้พัฒนา</h4>
    <button id="debug-reset-draw" style="display:block;width:100%;margin-bottom:5px;">รีเซ็ตการสุ่ม</button>
    <button id="debug-next-day" style="display:block;width:100%;margin-bottom:5px;">จำลองข้ามวัน</button>
    <button id="debug-add-exp" style="display:block;width:100%;margin-bottom:5px;">+100 EXP</button>
    <button id="debug-hard-reset" style="display:block;width:100%;color:#ff5252;">ล้างข้อมูลทั้งหมด</button>`;
  document.body.appendChild(menu);

  let clicks = 0;
  let timer = null;
  document.addEventListener('click', (event) => {
    const info = document.getElementById('app-info');
    if (info && info.contains(event.target)) {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 2000);
      if (clicks >= 15) { menu.style.display = 'block'; clicks = 0; }
    }
  });

  document.getElementById('debug-reset-draw').onclick = () => {
    const pd = loadPlayerData();
    if (!pd) return;
    pd.lastCardDrawDate = null;
    savePlayerData(pd);
    localStorage.removeItem('dailyCard');
    location.reload();
  };
  document.getElementById('debug-next-day').onclick = () => {
    const pd = loadPlayerData();
    if (!pd) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = todayKey(y);
    pd.lastCardDrawDate = ys;
    if (pd.todaysQuestion) pd.todaysQuestion.date = ys;
    if (pd.lastQuestionAnsweredDate) pd.lastQuestionAnsweredDate = ys;
    savePlayerData(pd);
    location.reload();
  };
  document.getElementById('debug-add-exp').onclick = () => {
    const pd = loadPlayerData();
    if (!pd) return;
    pd.exp += 100;
    pd.rank = getRankFromExp(pd.exp);
    savePlayerData(pd);
    location.reload();
  };
  document.getElementById('debug-hard-reset').onclick = () => {
    if (confirm('ล้างข้อมูลทั้งหมด?')) { localStorage.clear(); location.reload(); }
  };
}
