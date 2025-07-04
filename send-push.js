const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ONESIGNAL_APP_ID = '68a7a06b-4814-4d41-987a-f14c5631c5d5'; // <<< ของคุณ
const ONESIGNAL_API_KEY = 'os_v2_app_nct2a22icrgudgd26fgfmmof2u4zcrzd22zuwwvc3oxv2265hqu4ylndlpvhgq3eeq42ntpwiea2e23lonnbn5gadddmsc4pzvqm3va'; // <<< ของคุณ

async function sendNotification() {
  const body = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'],
    headings: { "en": "ไพ่หนุ่มฟูพร้อมสุ่มแล้ว!" },
    contents: { "en": "วันนี้สามารถเปิดไพ่หนุ่มฟูได้อีกครั้งแล้ว คลิกเพื่อเริ่มวันใหม่เลยนะคะ 🌈✨" },
    url: 'https://my-familiars.netlify.app/', // ลิงก์หน้าเว็บของคุณ
  };

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Basic ${ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log(data);
}

sendNotification();