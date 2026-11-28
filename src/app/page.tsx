'use client'
import {useEffect,useState} from 'react';import {useRouter} from 'next/navigation';import {sb} from '@/lib/supabase';import {electionConfig as D} from '@/config/electionConfig';import Splash from '@/components/Splash'
const Ic=({d}:{d:string})=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
export default function Home(){
 const r=useRouter();const [s,setS]=useState<any>(null);const [ready,setReady]=useState(false);const [usn,setUsn]=useState('');const [code,setCode]=useState('');const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{sessionStorage.clear()
  sb.rpc('get_public').then(({data})=>{setS(data?.settings);const u=(data?.candidates||[]).map((c:any)=>c.photo_url).filter(Boolean);let n=0
   if(!u.length)return setReady(true) // foto dimuat lebih dulu agar bilik suara langsung tampil
   u.forEach((x:string)=>{const i=new Image();i.onload=i.onerror=()=>{if(++n===u.length)setReady(true)};i.src=x})})},[])
 const logo=s?(s.logo_url||'/logo.png'):null
 const go=async()=>{if(usn.trim().length<2)return setErr('Isi username terlebih dahulu.');setBusy(true);setErr('')
  const {data,error}=await sb.rpc('verify_token',{c:code});setBusy(false)
  if(error||!data)return setErr('Gagal terhubung ke server.')
  if(data.status==='invalid')return setErr('Token tidak valid.')
  if(data.status==='used')return setErr('Token sudah digunakan pada '+new Date(data.used_at).toLocaleString('id-ID')+'.')
  sessionStorage.setItem('tok',code.trim().toUpperCase());sessionStorage.setItem('usn',usn.trim());r.push('/vote')}
 return <main className="relative min-h-screen overflow-hidden flex items-center justify-center p-5" style={{background:'radial-gradient(circle at 20% 10%,#fffaf0,#fdeec9 70%)'}}>
  <Splash logo={logo} ready={!!s&&ready}/>
  <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full border-[34px] border-sun/90" style={{boxShadow:'inset 0 0 0 6px #fff8, 8px 10px 24px #e8c25a66'}}/>
  <div className="absolute -top-8 left-24 w-16 h-16 rounded-full bg-flame/80" style={{boxShadow:'6px 8px 16px #f5863455,inset -4px -4px 8px #d86a1a66,inset 4px 4px 8px #ffc08a'}}/>
  <div className="absolute top-[38%] -right-20 w-44 h-44 rounded-full" style={{background:'linear-gradient(145deg,#ffe36b,#f58634)',boxShadow:'-10px 12px 28px #f5863455,inset 6px 6px 14px #fff8'}}/>
  <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full border-[40px] border-flame/80" style={{boxShadow:'inset 0 0 0 6px #fff7'}}/>
  <div className="absolute bottom-10 -left-10 w-28 h-28 rounded-full bg-ruby/85" style={{boxShadow:'8px 10px 20px #e91e2644,inset -6px -6px 12px #b5121866,inset 6px 6px 12px #ff7a7f'}}/>
  <section className="relative w-full max-w-[26rem]">
   <div className="neu mx-auto w-36 h-36 rounded-[2.4rem] flex items-center justify-center mb-6">{logo&&<img src={logo} alt="Logo" className="w-24 h-24 object-contain drop-shadow-md"/>}</div>
   <h1 className="text-center text-[1.65rem] leading-tight font-extrabold text-[#2b1a12]">{s?.event_name||D.eventName}</h1>
   {s?.theme&&<p className="text-center text-[#8a6a45] italic mt-1">{s.theme}</p>}
   <p className="text-center text-[11px] tracking-[.3em] uppercase text-[#a88a5e] mt-6 mb-5">Masuk untuk memilih</p>
   <div className="space-y-4">
    <label className="neu-in rounded-2xl flex items-center gap-3 px-4 h-14 text-[#8a6a45]"><Ic d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
     <input className="bg-transparent outline-none flex-1 text-[#2b1a12] placeholder:text-[#b39a76]" placeholder="Username" value={usn} onChange={e=>setUsn(e.target.value)} maxLength={40}/></label>
    <label className="neu-in rounded-2xl flex items-center gap-3 px-4 h-14 text-[#8a6a45]"><Ic d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>
     <input className="bg-transparent outline-none flex-1 uppercase tracking-widest text-[#2b1a12] placeholder:normal-case placeholder:tracking-normal placeholder:text-[#b39a76]" placeholder="Token (IPM-XXXXX)" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/></label></div>
   {err&&<p className="text-ruby text-sm font-semibold text-center mt-4">{err}</p>}
   <button className="neu-btn w-full h-14 rounded-2xl mt-6 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition" disabled={!usn||!code||busy} onClick={go}>{busy?'Memeriksa…':'Masuk'}<span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center"><Ic d="M5 12h14M13 6l6 6-6 6"/></span></button>
   <p className="text-center text-[10px] tracking-[.25em] uppercase text-[#a88a5e] mt-8">{s?.branch_name||D.branchName} · {s?.period||D.period}</p>
   <a href="/admin" className="block text-center mt-4 text-[10px] text-[#c9b48c]">Panitia</a></section></main>}
