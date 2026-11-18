// == ระบบข้อมูลผู้เล่น (เก็บในเครื่องผู้ใช้ด้วย localStorage) ==
// ย้ายมาจาก main.js เดิม ทำงานเหมือนเดิมทุกอย่าง

export function loadPlayerData() {
  try {
    const data = localStorage.getItem('playerData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function savePlayerData(data) {
  localStorage.setItem('playerData', JSON.stringify(data));
}

// คำนวณ Rank จาก EXP ตามระบบ Tier และ Division
export function getRankFromExp(exp) {
  const roman = ['V', 'IV', 'III', 'II', 'I'];
  if (exp < 500) return `Neophytus ${roman[Math.min(4, Math.floor(exp / 100))]}`;
  if (exp < 1500) return `Magus ${roman[Math.min(4, Math.floor((exp - 500) / 200))]}`;
  if (exp < 3000) return `Magister ${roman[Math.min(4, Math.floor((exp - 1500) / 300))]}`;
  if (exp < 5000) return `Dominus ${roman[Math.min(4, Math.floor((exp - 3000) / 400))]}`;
  return `Majores ${roman[Math.min(4, Math.floor((exp - 5000) / 500))]}`;
}

// คำนวณข้อมูลหลอด EXP
export function getExpProgress(exp) {
  let tierStartExp = 0;
  let expPerDivision = 100;
  if (exp >= 5000) { tierStartExp = 5000; expPerDivision = 500; }
  else if (exp >= 3000) { tierStartExp = 3000; expPerDivision = 400; }
  else if (exp >= 1500) { tierStartExp = 1500; expPerDivision = 300; }
  else if (exp >= 500) { tierStartExp = 500; expPerDivision = 200; }

  const expIntoTier = exp - tierStartExp;
  const current = expIntoTier % expPerDivision;
  return { current, required: expPerDivision, percentage: (current / expPerDivision) * 100 };
}

// เติม key ที่เพิ่มมาในเวอร์ชันหลัง ๆ ให้ข้อมูลเก่า
export function migratePlayerData(playerData) {
  if (!playerData) return playerData;
  let needsSave = false;
  if (playerData.answeredQuestions === undefined) { playerData.answeredQuestions = []; needsSave = true; }
  if (playerData.hasSeenDailyQuestion === undefined) { playerData.hasSeenDailyQuestion = false; needsSave = true; }
  if (!Array.isArray(playerData.collectedCards)) { playerData.collectedCards = []; needsSave = true; }
  if (needsSave) savePlayerData(playerData);
  return playerData;
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
