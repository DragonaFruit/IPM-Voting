-- UPDATE V2: jalankan di Supabase > SQL Editor (aman dijalankan berulang)
alter table settings add column if not exists theme text default '';
alter table settings add column if not exists photo_fit text default 'cover';
alter table settings add column if not exists photo_pos text default 'top';
create or replace function admin_save_settings(p_pin text,s jsonb) returns void language plpgsql security definer set search_path=public as $$
begin perform chk(p_pin);
 update settings set event_name=s->>'event_name',branch_name=s->>'branch_name',period=s->>'period',theme=coalesce(s->>'theme',''),
  max_select=(s->>'max_select')::int,mode=s->>'mode',admin_pin=s->>'admin_pin',logo_url=coalesce(s->>'logo_url',''),
  photo_fit=coalesce(s->>'photo_fit','cover'),photo_pos=coalesce(s->>'photo_pos','top') where id=1; end $$;
