'use client'
import {useEffect,useState} from 'react';import {useRouter} from 'next/navigation';import {sb,Avatar} from '@/lib/supabase'
export default function Vote(){
 const r=useRouter();const [d,setD]=useState<any>(null);const [sel,setSel]=useState<number[]>([]);const [ask,setAsk]=useState(false);const [done,setDone]=useState(false);const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{if(!sessionStorage.getItem('tok'))r.replace('/');sb.rpc('get_public').then(({data})=>setD(data))},[])
 if(done)return <main className="min-h-screen flex items-center justify-center bg-ipm p-4"><div className="bg-white rounded-3xl p-10 text-center max-w-md border-t-8 border-gold"><div className="text-6xl">✅</div><h1 className="text-2xl font-extrabold text-ipm mt-3">Terima Kasih</h1><p className="mb-6">Suara Anda telah tercatat.</p><button className="btn-g" onClick={()=>{sessionStorage.clear();r.replace('/')}}>Kembali ke Halaman Awal</button></div></main>
 if(!d)return <p className="p-10">Memuat…</p>
 const max=d.settings.max_select;const full=sel.length>=max
 const tog=(id:number)=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):s.length<max?[...s,id]:s)
 const ok=d.settings.mode==='exact'?sel.length===max:sel.length>0
 const submit=async()=>{setBusy(true);const {data}=await sb.rpc('submit_vote',{c:sessionStorage.getItem('tok'),ids:sel});setBusy(false)
  if(data==='ok'){sessionStorage.clear();setAsk(false);setDone(true)}else setErr(data==='used'?'Token sudah terpakai.':data==='rule'?'Pilihan tidak sesuai aturan.':'Gagal mengirim, coba lagi.')}
 return <main className="pb-28"><header className="sticky top-0 z-10 bg-ipm text-white p-3 flex items-center gap-3 flex-wrap shadow">
  {d.settings.logo_url&&<img src={d.settings.logo_url} className="h-10" alt=""/>}<div className="flex-1 min-w-40"><b>{d.settings.event_name}</b><div className="text-xs opacity-80">{d.settings.branch_name}</div></div>
  <span className="bg-gold text-ink font-bold rounded-full px-4 py-1">Terpilih: {sel.length} / {max} Formatur</span><button className="btn-o !text-white !border-white" onClick={()=>setSel([])}>Reset</button></header>
  <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  {d.candidates.map((c:any)=>{const on=sel.includes(c.id);const lock=full&&!on
   return <button key={c.id} disabled={lock} onClick={()=>tog(c.id)} className={`relative bg-white rounded-2xl p-4 flex flex-col items-center text-center border-4 transition ${on?'border-gold bg-yellow-50 shadow-lg':'border-transparent shadow'} ${lock?'opacity-40':''}`}>
    <span className="absolute top-2 left-2 bg-ipm text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">{c.number}</span>
    {on&&<span className="absolute top-2 right-2 text-ipm text-2xl">✔</span>}<Avatar name={c.name} url={c.photo_url} size={96}/>
    <b className="mt-2">{c.name}</b><span className="text-xs text-gray-500">{c.ranting}</span></button>})}</div>
  <div className="fixed bottom-0 inset-x-0 bg-white border-t p-3 flex justify-center"><button className="btn-y text-lg px-10" disabled={!ok} onClick={()=>{setErr('');setAsk(true)}}>Kirim Suara</button></div>
  {ask&&<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-20"><div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
   <h2 className="font-extrabold text-ipm text-xl mb-2">Konfirmasi Pilihan ({sel.length})</h2>
   <ol className="list-decimal pl-5 mb-3">{d.candidates.filter((c:any)=>sel.includes(c.id)).map((c:any)=><li key={c.id}>{c.name} <span className="text-xs text-gray-500">(No. {c.number})</span></li>)}</ol>
   {err&&<p className="text-red-600 text-sm mb-2">{err}</p>}<p className="text-sm text-gray-500 mb-3">Suara tidak dapat diubah setelah dikirim.</p>
   <div className="flex gap-2"><button className="btn-o flex-1" onClick={()=>setAsk(false)}>Periksa Lagi</button><button className="btn-g flex-1" disabled={busy} onClick={submit}>{busy?'Mengirim…':'Ya, Kirim'}</button></div></div></div>}</main>}
