importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

const CACHE_NAME = 'My-Familiars-v65'; // เปลี่ยนชื่อเวอร์ชันทุกครั้งที่อัปเดต

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/update-info.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/setting-icon.png',
  '/images/google-icon.png',
  '/images/facebook-icon.png',
  '/images/question-icon.png',
  '/images/card-back.png',
  '/images/Capybara.png',
  '/images/Alicorn.png',
  '/images/Dog.png',
  '/images/Cat.png',
  '/images/Frog.png',
  '/images/Jellyfish.png',
  '/images/Lion.png',
  '/images/Pigeon.png',
  '/images/Snake.png',
  '/images/chipmunk.png',
  '/images/Unicorn.png',
  '/sound/pop.MP3',
  '/sound/Swipe-card.MP3',
  '/sound/collect.MP3',
  '/sound/progress-bar.MP3',
  '/images/bg-noomfoo-full.png',
  '/images/bg-noomfoo-blue.png',
  '/images/ant.png',
  '/images/crocodile.png',
  '/images/rat.png',
  '/images/fox.png',
  '/images/phoenix.png',
  '/images/chinchilla.png',
  '/images/beaver.png',
  '/images/snow-leopard.png',
  '/images/weasel.png',
  '/images/hawk.png',
  '/images/loris.png',
  '/images/butterfly.png',
  '/images/deer.png',
  '/images/leaf.png',
  '/images/wheel-of-the-year.png',
  '/images/card-in-box.png',
  '/images/love.png',
  '/images/puma.png',
  '/images/goat.png',
  '/images/red-panda.png',
  '/images/sugar-glider.png',
  '/images/koala.png',
  '/images/tortoise.png',
  '/images/ferret.png',
  '/images/penguin.png',
  '/images/bison.png',
  '/images/hedgehog.png',
  '/images/boar.png',
  '/images/seal.png',
  '/images/parrot.png',
  '/images/wolf.png',
  '/images/elephant.png',
  '/images/polar-bear.png',
  '/images/swan.png',
  '/images/raccoon.png',
  '/images/white-head-eagle.png',
  '/images/bat.png',
  '/images/crow.png',
  '/images/owl.png',
  '/images/moth.png',
  '/images/rabbit.png',
  '/images/grizzly-bear.png',
  '/images/cheetah.png',
  '/images/duck.png',
  '/images/dragon.png',
  '/images/back-button.png',
  '/images/cursor.png',
  '/images/egg.png',
  '/images/snake-share.png',
  'https://fonts.googleapis.com/css2?family=Itim&display=swap'
];



self.addEventListener('install', event => {
  console.log('[SW] Installing and caching app shell...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // *** ไม่ต้อง self.skipWaiting() ตรงนี้ ***
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating and cleaning old caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name); // ลบ cache เก่า
          }
        })
      );
    })
  );
  self.clients.claim(); // คงไว้ได้
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// รับ message จากหน้าเว็บ ถ้าต้องการอัปเดตทันที (กรณีกดปุ่ม)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});