import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt',        // ถามผู้ใช้ก่อนอัปเดต (แสดงกล่อง "มีเวอร์ชันใหม่")
      injectRegister: false,         // ลงทะเบียนเองใน src/lib/pwa.js
      manifest: false,               // ใช้ public/manifest.json เดิม
      workbox: {
        // เก็บไฟล์หลักของแอปไว้ในเครื่อง ใช้งานออฟไลน์ได้
        globPatterns: ['**/*.{js,css,html,json,MP3}'],
        globIgnores: ['card/**', 'data/**'],
        navigateFallbackDenylist: [/^\/\.netlify\//, /^\/card\//],
        runtimeCaching: [
          {
            // รูปภาพ: โหลดครั้งแรกแล้วเก็บไว้ (ไม่โหลดล่วงหน้าทั้งหมด เพื่อประหยัดเน็ตผู้ใช้)
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60 } }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'library-data' }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts' }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
