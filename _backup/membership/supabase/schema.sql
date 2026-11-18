-- =====================================================================
-- My Familiars — โครงสร้างฐานข้อมูล Supabase
-- วิธีใช้: Supabase Dashboard → SQL Editor → New query → วางทั้งไฟล์ → Run
-- รันซ้ำได้ (ไม่ลบข้อมูลเดิม)
--
-- หลักความปลอดภัย:
--   * ทุกตารางเปิด RLS (Row Level Security)
--   * ผู้ใช้อ่าน/แก้ได้เฉพาะข้อมูลของตัวเอง
--   * สิทธิ์พรีเมียม (entitlements) และการชำระเงิน (payments) ผู้ใช้ "แก้เองไม่ได้"
--     เขียนได้เฉพาะฝั่ง server ที่ใช้ service_role key เท่านั้น
-- =====================================================================

-- ---------- 1) โปรไฟล์ผู้ใช้ ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- สร้างโปรไฟล์อัตโนมัติเมื่อมีผู้ใช้ใหม่
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- 2) สิทธิ์พรีเมียม (ผู้ใช้อ่านของตัวเองได้อย่างเดียว) ----------
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  premium_until timestamptz,
  source text,                         -- เช่น 'patreon', 'omise', 'manual'
  updated_at timestamptz not null default now()
);
alter table public.entitlements enable row level security;

drop policy if exists "entitlements: read own" on public.entitlements;
create policy "entitlements: read own" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);
-- ไม่มี policy สำหรับ insert/update/delete = ผู้ใช้เขียนไม่ได้ (เฉพาะ service_role)

create or replace function public.is_premium()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = (select auth.uid()) and e.premium_until > now()
  );
$$;

-- ---------- 3) ประวัติการชำระเงิน (เขียนจาก webhook ฝั่ง server เท่านั้น) ----------
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  provider_ref text unique,            -- เลขอ้างอิงจากผู้ให้บริการ กันบันทึกซ้ำ
  amount_satang integer not null check (amount_satang >= 0),
  status text not null,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;

drop policy if exists "payments: read own" on public.payments;
create policy "payments: read own" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------- 4) คลังความรู้ (บทความจากเพจ) ----------
-- articles = หัวเรื่อง/หมวด (ทุกคนอ่านได้เมื่อเผยแพร่แล้ว)
create table if not exists public.articles (
  id text primary key,                 -- ใช้ id จากไฟล์นำเข้า เช่น 'fb-1700000000'
  title text not null,
  excerpt text,
  category text,
  published_at timestamptz,
  is_premium boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  source text default 'facebook',
  source_url text,                     -- ลิงก์โพสต์ต้นฉบับบน Facebook
  created_at timestamptz not null default now()
);
alter table public.articles add column if not exists source_url text;
alter table public.articles enable row level security;

drop policy if exists "articles: read published" on public.articles;
create policy "articles: read published" on public.articles
  for select to anon, authenticated using (status = 'published');

-- article_bodies = เนื้อหาเต็ม (บทความพรีเมียมอ่านได้เฉพาะสมาชิกพรีเมียม)
create table if not exists public.article_bodies (
  article_id text primary key references public.articles(id) on delete cascade,
  body text not null default '',
  image_url text
);
alter table public.article_bodies enable row level security;

drop policy if exists "article_bodies: read allowed" on public.article_bodies;
create policy "article_bodies: read allowed" on public.article_bodies
  for select to anon, authenticated using (
    exists (
      select 1 from public.articles a
      where a.id = article_id and a.status = 'published'
        and (a.is_premium = false or public.is_premium())
    )
  );

create or replace view public.article_categories with (security_invoker = true) as
  select distinct category from public.articles
  where status = 'published' and category is not null;

create index if not exists articles_published_idx on public.articles (status, published_at desc);
create index if not exists articles_category_idx on public.articles (category);

-- ---------- 5) ลบบัญชีตัวเอง (ข้อกำหนดของ App Store / Google Play / PDPA) ----------
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = (select auth.uid());
end; $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
