// ระบบสมาชิก: เข้าสู่ระบบด้วยอีเมล (ส่งลิงก์ไปที่อีเมล ไม่ต้องจำรหัสผ่าน)
// สิทธิ์พรีเมียมอ่านจากตาราง entitlements ซึ่ง "ผู้ใช้แก้เองไม่ได้" (กำหนดโดย RLS)
// ระบบชำระเงินจริงจะเป็นฝั่ง server เท่านั้น (netlify/functions/payment-webhook.js)
import { supabase, isCloudEnabled } from './supabase.js';

export async function getSession() {
  if (!isCloudEnabled) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function sendLoginLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getPremiumStatus() {
  const session = await getSession();
  if (!session) return { isPremium: false, until: null };
  const { data, error } = await supabase
    .from('entitlements')
    .select('premium_until')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error || !data?.premium_until) return { isPremium: false, until: null };
  const until = new Date(data.premium_until);
  return { isPremium: until > new Date(), until };
}

export async function deleteMyAccount() {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut();
}

// ⚙️ เปิดปุ่มชำระเงินเมื่อพร้อม (ตั้ง VITE_PAYMENTS_ENABLED=true ใน Netlify)
export const paymentsEnabled = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';
