'use client'
import {useEffect,useState} from 'react';import {useRouter} from 'next/navigation';import {sb} from '@/lib/supabase'
const bg={background:'radial-gradient(circle at 20% 10%,#fffaf0,#fdeec9 70%)'}
const Photo=({c,fit,pos}:{c:any,fit:string,pos:string})=>c.photo_url?<img src={c.photo_url} alt={c.name} className="w-full h-full" style={{objectFit:fit as any,objectPosition:pos}}/>:<div className="w-full h-full flex items-center justify-center text-5xl font-extrabold text-white" style={{background:'linear-gradient(145deg,#F58634,#E91E26)'}}>{(c.name||'?').split(' ').slice(0,2).map((w:string)=>w[0]).join('').toUpperCase()}</div>
export default function Vote(){
 const r=useRouter();const [d,setD]=useState<any>(null);const [usn,setUsn]=useState('');const [sel,setSel]=useState<number[]>([]);const [ask,setAsk]=useState(false);const [done,setDone]=useState(false);const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{if(!sessionStorage.getItem('tok'))r.replace('/');setUsn(sessionStorage.getItem('usn')||'');sb.rpc('get_public').then(({data})=>setD(data))},[])
 if(!d)return <main className="min-h-screen" style={bg}/>
 const S=d.settings;const logo=S.logo_url||'/logo.png';const fit=S.photo_fit||'cover';const pos=S.photo_pos||'top';const max=S.max_select;const full=sel.length>=max
 if(done)return <main className="min-h-screen flex items-center justify-center p-5" style={bg}><div className="neu rounded-[2rem] p-10 text-center max-w-md w-full"><img src={logo} alt="" className="h-20 mx-auto mb-4"/><h1 className="text-2xl font-extrabold text-[#2b1a12]">Terima Kasih{usn?`, ${usn}`:''}</h1><p className="text-[#8a6a45] mb-6">Suara Anda telah tercatat.</p><button className="neu-btn rounded-2xl px-8 h-12 font-bold" onClick={()=>{sessionStorage.clear();r.replace('/')}}>Kembali ke Halaman Awal</button></div></main>
 const tog=(id:number)=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):s.length<max?[...s,id]:s)
 const ok=S.mode==='exact'?sel.length===max:sel.length>0
 const submit=async()=>{setBusy(true);const {data}=await sb.rpc('submit_vote',{c:sessionStorage.getItem('tok'),ids:sel});setBusy(false)
  if(data==='ok'){sessionStorage.clear();setAsk(false);setDone(true)}else setErr(data==='used'?'Token sudah terpakai.':data==='rule'?'Pilihan tidak sesuai aturan.':'Gagal mengirim, coba lagi.')}
 return <main className="min-h-screen pb-32" style={bg}>
  <header className="sticky top-0 z-20 px-3 pt-3"><div className="neu rounded-3xl max-w-5xl mx-auto px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
   <div className="text-[11px] text-[#8a6a45] truncate">Halo,<br/><b className="text-sm text-[#2b1a12]">{usn}</b></div>
   <div className="flex flex-col items-center text-center"><img src={logo} alt="" className="h-12 object-contain"/><b className="text-[#2b1a12] leading-tight mt-1">{S.event_name}</b>{S.theme&&<span className="text-xs italic text-[#8a6a45]">{S.theme}</span>}</div>
   <div className="justify-self-end neu-in rounded-full px-3 py-1.5 text-sm font-bold text-ruby whitespace-nowrap">{sel.length} / {max}<span className="hidden sm:inline text-[#8a6a45] font-semibold"> Formatur</span></div></div></header>
  <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8">
  {d.candidates.map((c:any)=>{const on=sel.includes(c.id);const lock=full&&!on
   return <button key={c.id} disabled={lock} onClick={()=>tog(c.id)} className={`text-left rounded-3xl p-3 transition duration-300 ${on?'neu-in ring-4 ring-flame/70':'neu'} ${lock?'opacity-40':'hover:-translate-y-1'}`}>
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#f3e2bb]"><Photo c={c} fit={fit} pos={pos}/>
     <span className="absolute top-2 left-2 w-9 h-9 rounded-full neu-btn text-sm font-bold flex items-center justify-center">{c.number}</span>
     {on&&<span className="absolute inset-0 bg-flame/20 flex items-start justify-end p-2"><span className="w-9 h-9 rounded-full bg-white text-ruby flex items-center justify-center font-black shadow">✔</span></span>}</div>
    <div className="pt-3 px-1"><div className="font-bold leading-tight text-[#2b1a12]">{c.name}</div><div className="text-xs text-[#8a6a45] mt-0.5">{c.ranting}</div></div></button>})}</div>
  <button onClick={()=>setSel([])} aria-label="Reset pilihan" className={`bubble neu fixed bottom-6 left-5 z-30 w-16 h-16 rounded-full flex flex-col items-center justify-center text-ruby transition-all duration-300 ${sel.length?'scale-100 opacity-100':'scale-0 opacity-0 pointer-events-none'}`}>
   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg><span className="text-[10px] font-bold">Reset</span></button>
  <div className="fixed bottom-5 inset-x-0 flex justify-center pointer-events-none"><button className="pointer-events-auto neu-btn rounded-2xl px-10 h-14 text-lg font-bold disabled:opacity-40" disabled={!ok} onClick={()=>{setErr('');setAsk(true)}}>Kirim Suara</button></div>
  {ask&&<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40"><div className="neu rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
   <h2 className="font-extrabold text-[#2b1a12] text-xl mb-2">Konfirmasi Pilihan ({sel.length})</h2>
   <ol className="list-decimal pl-5 mb-3 text-[#2b1a12]">{d.candidates.filter((c:any)=>sel.includes(c.id)).map((c:any)=><li key={c.id}>{c.name} <span className="text-xs text-[#8a6a45]">(No. {c.number})</span></li>)}</ol>
   {err&&<p className="text-ruby text-sm mb-2">{err}</p>}<p className="text-sm text-[#8a6a45] mb-4">Suara tidak dapat diubah setelah dikirim.</p>
   <div className="flex gap-3"><button className="neu rounded-2xl flex-1 h-12 font-semibold text-[#2b1a12]" onClick={()=>setAsk(false)}>Periksa Lagi</button><button className="neu-btn rounded-2xl flex-1 h-12 font-bold disabled:opacity-50" disabled={busy} onClick={submit}>{busy?'Mengirim…':'Ya, Kirim'}</button></div></div></div>}</main>}
