// ไฟล์: netlify/functions/get-user.js

// ดึงเครื่องมือสำหรับเชื่อมต่อกับ Supabase เข้ามา
const { createClient } = require('@supabase/supabase-js');

// นี่คือโค้ดหลักที่จะทำงานเมื่อมีคนเรียก API นี้
exports.handler = async function(event, context) {
  
  // ดึงข้อมูลการเชื่อมต่อจาก Environment Variables ที่เราตั้งค่าในเว็บ Netlify
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Netlify จะส่งข้อมูล user ที่กำลังล็อกอินอยู่มาให้เราใน context.clientContext
  const { user } = context.clientContext;

  // ถ้าไม่มี user ล็อกอินอยู่ ก็แจ้งว่าไม่ได้รับอนุญาต
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    // ไปดึงข้อมูลจากตาราง profiles ใน Supabase
    // โดยหาแถวที่ id ตรงกับ id ของผู้ใช้ที่ล็อกอินอยู่
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.sub) // user.sub คือ ID ของผู้ใช้
      .single(); // .single() คือการบอกว่าเราต้องการข้อมูลแค่แถวเดียว

    if (error) {
      // ถ้า Supabase ส่ง error กลับมา ก็ให้ส่ง error นั้นออกไป
      throw error;
    }

    // ถ้าทุกอย่างสำเร็จ ส่งข้อมูลโปรไฟล์กลับไป
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};