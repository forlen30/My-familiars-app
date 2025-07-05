// ไฟล์: firebase-messaging-sw.js

// Import สคริปต์ของ Firebase สำหรับ Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// วาง Config เดียวกันกับใน main.js
const firebaseConfig = {
  apiKey: "AIzaSyB-pwqwWI8c9BKWDGcqFWGOjv06rryWap8",
  authDomain: "my-familiars.firebaseapp.com",
  projectId: "my-familiars",
  storageBucket: "my-familiars.firebasestorage.app",
  messagingSenderId: "644836742671",
  appId: "1:644836742671:web:2109ef8cb711d653d2b57a",
  measurementId: "G-LGMMQ2THWP"
};

// เริ่มการเชื่อมต่อ Firebase
firebase.initializeApp(firebaseConfig);

// รับ instance ของ Messaging
const messaging = firebase.messaging();

// เพิ่ม Event Listener เพื่อจัดการกับ Notification ที่เข้ามาตอนแอปอยู่เบื้องหลัง
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // กำหนดหน้าตาของ Notification ที่จะแสดง
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/icon-192.png' // <-- ไอคอนของแอปคุณ
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});