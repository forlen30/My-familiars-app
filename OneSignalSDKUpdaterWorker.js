importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// --- ตัวอย่าง PWA update logic เพิ่มไปด้านล่าง ---
// ถ้าต้องการ custom update event หรือ cache bust
self.addEventListener('install', event => {
  // force update logic (clear cache, หรือ update logic อื่นๆ)
  // console.log('PWA updated!');
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  // Clear old caches, etc. if needed
  self.clients.claim();
});
