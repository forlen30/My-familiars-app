// netlify/functions/send-notification.js
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// ดึงค่า Key ลับที่เราตั้งไว้ใน Netlify
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Initialize Firebase Admin (ถ้ายังไม่เคยทำ)
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  try {
    console.log("Function starting...");

    // 1. ดึง Token ทั้งหมดจาก Supabase
    const { data: tokensData, error: tokenError } = await supabase
      .from('fcm_tokens')
      .select('token');
      
    if (tokenError) throw tokenError;
    
    const tokens = tokensData.map(t => t.token);
    if (tokens.length === 0) {
      return { statusCode: 200, body: "No tokens to send to." };
    }
    console.log(`Found ${tokens.length} tokens.`);

    // 2. สร้างข้อความที่จะส่ง
    const message = {
      notification: {
        title: 'ทดสอบการแจ้งเตือน!',
        body: 'นี่คือข้อความทดสอบจากเซิร์ฟเวอร์'
      },
      tokens: tokens,
    };

    // 3. ส่งข้อความผ่าน Firebase Admin
    const response = await admin.messaging().sendEachForMulticast(message); // ใช้ sendEachForMulticast
    console.log('Successfully sent message:', response);

    return {
      statusCode: 200,
      body: `Successfully sent ${response.successCount} messages.`,
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};