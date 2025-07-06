// ไฟล์: firebase-messaging-sw.js (ฉบับแก้ไขสมบูรณ์)

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyB-pwqwWI8c9BKWDGcqFWGOjv06rryWap8",
  authDomain: "my-familiars.firebaseapp.com",
  projectId: "my-familiars",
  storageBucket: "my-familiars.firebasestorage.app",
  messagingSenderId: "644836742671",
  appId: "1:644836742671:web:2109ef8cb711d653d2b57a",
  measurementId: "G-LGMMQ2THWP"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  console.log("[SW] Received background message ", payload);

  // --- ส่วนที่แก้ไขปัญหา ---
  // 1. ตรวจสอบ Notification ที่มีอยู่ทั้งหมด
  const existingNotifications = await self.registration.getNotifications({
    tag: 'my-familiars-notification' // เช็คจาก tag ที่เราจะตั้ง
  });

  // 2. ถ้ามี Notification ที่ใช้ tag นี้แสดงอยู่แล้ว ให้ปิดอันเก่าก่อน
  if (existingNotifications.length > 0) {
    console.log("[SW] Closing existing notifications.");
    existingNotifications.forEach(notification => notification.close());
  }
  // --- สิ้นสุดส่วนที่แก้ไข ---

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/icon-192.png',
    tag: 'my-familiars-notification' // กำหนด tag ให้กับ Notification
  };

  // แสดง Notification ใหม่
  await self.registration.showNotification(notificationTitle, notificationOptions);
});