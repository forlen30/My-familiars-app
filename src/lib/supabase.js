// การเชื่อมต่อ Supabase (ระบบสมาชิก/ฐานข้อมูลออนไลน์)
//
// ความปลอดภัย:
// - ค่าทั้งสองตัวอ่านจาก Environment Variables ที่ตั้งใน Netlify เท่านั้น ไม่เขียนลงในโค้ด
// - ใช้ได้เฉพาะ "anon / publishable key" ห้ามใส่ service_role key ในฝั่งเว็บเด็ดขาด
// - ข้อมูลจะปลอดภัยได้ก็ต่อเมื่อเปิด RLS ทุกตาราง (ดู supabase/schema.sql)
//
// ถ้ายังไม่ได้ตั้งค่า แอปจะทำงานแบบออฟไลน์ตามเดิม และซ่อนเมนูสมาชิกไว้
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isCloudEnabled = Boolean(url && anonKey);

export const supabase = isCloudEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;
