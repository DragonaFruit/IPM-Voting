-- Jalankan seluruh isi file ini di Supabase > SQL Editor > Run
create table if not exists settings(id int primary key default 1 check(id=1),event_name text,branch_name text,period text,max_select int default 9,mode text default 'max',admin_pin text default '123456',logo_url text default '');
insert into settings(event_name,branch_name,period) values('Musycab XX','PC IPM ...','Periode 2026–2028') on conflict do nothing;
create table if not exists candidates(id serial primary key,number int,name text not null,ranting text,photo_url text default '');
create table if not exists tokens(code text primary key,used_at timestamptz);
create table if not exists votes(id bigserial primary key,candidate_id int references candidates(id) on delete cascade,created_at timestamptz default now());
alter table settings enable row level security; alter table candidates enable row level security;
alter table tokens enable row level security; alter table votes enable row level security;
-- (tanpa policy: tabel tidak bisa diakses langsung, hanya lewat fungsi di bawah)

create or replace function get_public() returns json language sql security definer set search_path=public as $$
 select json_build_object('settings',(select to_jsonb(s)-'admin_pin' from settings s),
 'candidates',coalesce((select json_agg(c order by c.number) from candidates c),'[]'::json)) $$;

create or replace function verify_token(c text) returns json language plpgsql security definer set search_path=public as $$
declare t tokens; begin
 select * into t from tokens where code=upper(trim(c));
 if not found then return json_build_object('status','invalid'); end if;
 if t.used_at is not null then return json_build_object('status','used','used_at',t.used_at); end if;
 return json_build_object('status','ok'); end $$;

-- ANTI DOUBLE-VOTE: baris token dikunci (FOR UPDATE), cek + simpan + tandai used dalam 1 transaksi
create or replace function submit_vote(c text, ids int[]) returns text language plpgsql security definer set search_path=public as $$
declare s settings; t tokens; n int; begin
 select * into s from settings;
 select * into t from tokens where code=upper(trim(c)) for update;
 if not found then return 'invalid'; end if;
 if t.used_at is not null then return 'used'; end if;
 n:=coalesce(array_length(ids,1),0);
 if n=0 or n<>(select count(distinct x) from unnest(ids) x) then return 'rule'; end if;
 if n>s.max_select or (s.mode='exact' and n<>s.max_select) then return 'rule'; end if;
 insert into votes(candidate_id) select unnest(ids);
 update tokens set used_at=now() where code=t.code;
 return 'ok'; end $$;

create or replace function chk(p_pin text) returns void language plpgsql security definer set search_path=public as $$
begin if p_pin is distinct from (select admin_pin from settings) then raise exception 'PIN salah'; end if; end $$;

create or replace function admin_data(p_pin text) returns json language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin);
 return json_build_object('settings',(select to_json(s) from settings s),
 'candidates',coalesce((select json_agg(json_build_object('id',c.id,'number',c.number,'name',c.name,'ranting',c.ranting,'photo_url',c.photo_url,'votes',(select count(*) from votes v where v.candidate_id=c.id)) order by c.number) from candidates c),'[]'::json),
 'tokens',coalesce((select json_agg(t order by t.code) from tokens t),'[]'::json)); end $$;

create or replace function admin_save_settings(p_pin text,s jsonb) returns void language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin);
 update settings set event_name=s->>'event_name',branch_name=s->>'branch_name',period=s->>'period',max_select=(s->>'max_select')::int,mode=s->>'mode',admin_pin=s->>'admin_pin',logo_url=s->>'logo_url' where id=1; end $$;

create or replace function admin_save_candidate(p_pin text,p_id int,p_number int,p_name text,p_ranting text,p_photo text) returns void language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin);
 if p_id is null then insert into candidates(number,name,ranting,photo_url) values(p_number,p_name,p_ranting,coalesce(p_photo,''));
 else update candidates set number=p_number,name=p_name,ranting=p_ranting,photo_url=coalesce(p_photo,'') where id=p_id; end if; end $$;

create or replace function admin_delete_candidate(p_pin text,p_id int) returns void language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin); delete from candidates where id=p_id; end $$;

create or replace function admin_gen_tokens(p_pin text,n int) returns void language plpgsql security definer set search_path=public as $$
declare made int:=0; r int; begin perform chk(p_pin);
 while made<n loop
  insert into tokens(code) values('IPM-'||upper(substr(md5(random()::text||clock_timestamp()::text),1,5))) on conflict do nothing;
  get diagnostics r = row_count; made:=made+r;
 end loop; end $$;

-- Reset data simulasi: hapus semua suara & kembalikan token jadi belum terpakai
create or replace function admin_reset(p_pin text) returns void language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin); delete from votes where true; update tokens set used_at=null where true; end $$;
-- UPDATE V2: jalankan di Supabase > SQL Editor (aman dijalankan berulang)
alter table settings add column if not exists theme text default '';
alter table settings add column if not exists photo_fit text default 'cover';
alter table settings add column if not exists photo_pos text default 'top';
create or replace function admin_save_settings(p_pin text,s jsonb) returns void language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin);
 update settings set event_name=s->>'event_name',branch_name=s->>'branch_name',period=s->>'period',theme=coalesce(s->>'theme',''),
  max_select=(s->>'max_select')::int,mode=s->>'mode',admin_pin=s->>'admin_pin',logo_url=coalesce(s->>'logo_url',''),
  photo_fit=coalesce(s->>'photo_fit','cover'),photo_pos=coalesce(s->>'photo_pos','top') where id=1; end $$;
