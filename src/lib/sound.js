// เสียงประกอบ (ชื่อไฟล์ต้องตรงตัวพิมพ์เล็ก-ใหญ่ เพราะเซิร์ฟเวอร์แยกตัวพิมพ์)
export const sfxPop = new Audio('/sound/pop.MP3');
export const sfxSwipe = new Audio('/sound/Swipe-card.MP3');
export const sfxCollect = new Audio('/sound/collect.MP3');
export const sfxProgressBar = new Audio('/sound/progress-bar.MP3');

// เล่นเสียงแบบไม่ให้ error ขึ้น console เมื่อเบราว์เซอร์ยังไม่อนุญาตให้เล่นเสียง
export function play(sfx) {
  try {
    sfx.currentTime = 0;
    const p = sfx.play();
    if (p && p.catch) p.catch(() => {});
  } catch { /* ignore */ }
}
