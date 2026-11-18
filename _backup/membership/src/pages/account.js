import { sfxPop, play } from '../lib/sound.js';
import { getRoot, playSlideTransition, trackPageView } from '../lib/ui.js';
import { escapeHtml } from '../lib/escape.js';
import { isCloudEnabled } from '../lib/supabase.js';
import { getSession, sendLoginLink, signOut, getPremiumStatus, deleteMyAccount, paymentsEnabled } from '../lib/account.js';
import { showHome } from './home.js';

// สิทธิประโยชน์ของสมาชิกพรีเมียม ✏️ แก้ข้อความได้ตามแผนธุรกิจ
const PREMIUM_PERKS = [
  'อ่านบทความพิเศษในคลังความรู้ได้ทั้งหมด',
  'พิธีกรรมและคาถาเฉพาะสมาชิก',
  'สนับสนุนเพจ Magic Books & Candle โดยตรง'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bindBack() {
  document.getElementById('btn-back').onclick = () => { play(sfxPop); playSlideTransition(showHome); };
}

export async function showAccountPage() {
  trackPageView('/account', 'Account');
  const root = getRoot();
  if (!root) return;
  window.scrollTo(0, 0);

  if (!isCloudEnabled) {
    root.innerHTML = `
      <div class="window"><h2>บัญชีของฉัน</h2><p>ระบบสมาชิกยังไม่เปิดใช้งาน</p></div>
      <div class="button-group"><button id="btn-back">กลับ</button></div>`;
    setTimeout(bindBack, 30);
    return;
  }

  const session = await getSession();

  if (!session) {
    root.innerHTML = `
      <div class="window account-page">
        <h2>เข้าสู่ระบบ</h2>
        <p>ใส่อีเมลของคุณ เราจะส่งลิงก์เข้าสู่ระบบไปให้<br><small>ไม่ต้องตั้งรหัสผ่าน</small></p>
        <input type="email" id="login-email" placeholder="you@example.com" autocomplete="email" maxlength="120">
        <button id="btn-send-link" class="button">ส่งลิงก์เข้าสู่ระบบ</button>
        <p id="login-status" class="account-status" role="status"></p>
        <p class="account-fineprint">การเข้าสู่ระบบถือว่าคุณยอมรับ <a href="/privacy.html" target="_blank" rel="noopener">นโยบายความเป็นส่วนตัว</a></p>
      </div>
      <div class="button-group"><button id="btn-back">กลับ</button></div>`;

    setTimeout(() => {
      bindBack();
      const btn = document.getElementById('btn-send-link');
      const status = document.getElementById('login-status');
      btn.onclick = async () => {
        play(sfxPop);
        const email = document.getElementById('login-email').value.trim();
        if (!EMAIL_RE.test(email)) { status.textContent = 'รูปแบบอีเมลไม่ถูกต้อง'; return; }
        btn.disabled = true;
        status.textContent = 'กำลังส่ง...';
        try {
          await sendLoginLink(email);
          status.textContent = 'ส่งลิงก์แล้ว! เปิดอีเมลแล้วกดลิงก์เพื่อเข้าสู่ระบบ ✨';
        } catch (e) {
          status.textContent = 'ส่งไม่สำเร็จ ลองใหม่อีกครั้งในอีกสักครู่';
          btn.disabled = false;
        }
      };
    }, 30);
    return;
  }

  const premium = await getPremiumStatus();
  const untilText = premium.until ? premium.until.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  root.innerHTML = `
    <div class="window account-page">
      <h2>บัญชีของฉัน</h2>
      <p class="account-email">${escapeHtml(session.user.email)}</p>
      <div class="premium-box ${premium.isPremium ? 'active' : ''}">
        <strong>${premium.isPremium ? '🌟 สมาชิกพรีเมียม' : 'สมาชิกทั่วไป'}</strong>
        ${premium.isPremium ? `<p>ใช้สิทธิ์ได้ถึง ${untilText}</p>` : `
          <ul>${PREMIUM_PERKS.map(p => `<li>${p}</li>`).join('')}</ul>
          <button class="button" id="btn-upgrade" ${paymentsEnabled ? '' : 'disabled'}>
            ${paymentsEnabled ? 'สมัครสมาชิกพรีเมียม' : 'สมัครสมาชิก (เร็ว ๆ นี้)'}
          </button>`}
      </div>
      <button class="button" id="btn-logout">ออกจากระบบ</button>
      <p><button class="link-button" id="btn-delete-account">ลบบัญชีของฉัน</button></p>
    </div>
    <div class="button-group"><button id="btn-back">กลับ</button></div>`;

  setTimeout(() => {
    bindBack();
    document.getElementById('btn-logout').onclick = async () => {
      play(sfxPop);
      await signOut();
      showAccountPage();
    };
    document.getElementById('btn-delete-account').onclick = async () => {
      if (!confirm('ลบบัญชีถาวร? ข้อมูลสมาชิกและสิทธิ์พรีเมียมจะหายทั้งหมด และกู้คืนไม่ได้')) return;
      try {
        await deleteMyAccount();
        alert('ลบบัญชีเรียบร้อยแล้ว');
        playSlideTransition(showHome);
      } catch {
        alert('ลบบัญชีไม่สำเร็จ กรุณาติดต่อเพจ');
      }
    };
    const up = document.getElementById('btn-upgrade');
    if (up && paymentsEnabled) {
      up.onclick = () => {
        // TODO: เมื่อเลือกผู้ให้บริการรับเงินแล้ว ให้ส่งผู้ใช้ไปหน้าชำระเงินของผู้ให้บริการ
        // ห้ามให้สิทธิ์พรีเมียมจากฝั่งหน้าเว็บเด็ดขาด สิทธิ์ต้องมาจาก payment-webhook เท่านั้น
        alert('ระบบชำระเงินกำลังเตรียมเปิดให้บริการ');
      };
    }
  }, 30);
}
