// ระบบ PWA: ติดตั้ง Service Worker + แจ้งเตือนเมื่อมีเวอร์ชันใหม่
// Service Worker ถูกสร้างอัตโนมัติตอน build (vite-plugin-pwa) ไม่ต้องแก้รายชื่อไฟล์เองอีกแล้ว
import { registerSW } from 'virtual:pwa-register';
import { escapeHtml } from './escape.js';

let deferredInstallPrompt = null;

export function setupPwa() {
  const updateSW = registerSW({
    onNeedRefresh() {
      showUpdateNotification(() => updateSW(true));
    },
    onRegisterError(error) {
      console.error('Service Worker registration failed:', error);
    }
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
}

export function getInstallPrompt() {
  return deferredInstallPrompt;
}

async function showUpdateNotification(onUpdate) {
  try {
    const response = await fetch('/update-info.json?v=' + Date.now());
    const { version, notes } = await response.json();
    const container = document.createElement('div');
    container.className = 'update-notification-container';
    const notesHtml = (notes || []).map(n => `<li>${escapeHtml(n)}</li>`).join('');
    container.innerHTML = `
      <div class="update-box">
        <h2>มีเวอร์ชันใหม่อัปเดต! ✨</h2>
        <p>เวอร์ชัน: <strong>${escapeHtml(version)}</strong></p>
        <p>มีอะไรใหม่:</p>
        <ul class="update-notes">${notesHtml}</ul>
        <button id="update-now-button" class="button">อัปเดตทันที</button>
      </div>
    `;
    document.body.appendChild(container);
    document.getElementById('update-now-button').addEventListener('click', () => {
      container.remove();
      onUpdate();
    });
  } catch (error) {
    console.error('ไม่สามารถแสดงกล่องอัปเดตได้:', error);
  }
}
