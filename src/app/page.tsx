'use client'
import {useEffect,useState} from 'react';import {useRouter} from 'next/navigation';import {sb} from '@/lib/supabase';import {electionConfig as D} from '@/config/electionConfig'
export default function Home(){
 const r=useRouter();const [s,setS]=useState<any>(null);const [code,setCode]=useState('');const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{sessionStorage.clear();sb.rpc('get_public').then(({data})=>setS(data?.settings))},[])
 const go=async()=>{setBusy(true);setErr('');const {data,error}=await sb.rpc('verify_token',{c:code});setBusy(false)
  if(error||!data)return setErr('Gagal terhubung ke server.')
  if(data.status==='invalid')return setErr('Token tidak valid.')
  if(data.status==='used')return setErr('Token sudah digunakan pada '+new Date(data.used_at).toLocaleString('id-ID')+'.')
  sessionStorage.setItem('tok',code.trim().toUpperCase());r.push('/vote')}
 return <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ipm to-green-900 p-4">
  <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border-t-8 border-gold">
   {s?.logo_url&&<img src={s.logo_url} className="h-24 mx-auto mb-3" alt="logo"/>}
   <h1 className="text-2xl font-extrabold text-ipm">{s?.event_name||D.eventName}</h1>
   <p className="font-semibold">{s?.branch_name||D.branchName}</p><p className="text-sm text-gray-500 mb-6">Pemilihan Calon Formatur · {s?.period||D.period}</p>
   <input className="inp text-center text-xl tracking-widest uppercase" placeholder="IPM-XXXXX" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/>
   {err&&<p className="text-red-600 mt-3 text-sm font-medium">{err}</p>}
   <button className="btn-g w-full mt-4" disabled={!code||busy} onClick={go}>{busy?'Memeriksa…':'Masuk Bilik Suara'}</button>
   <a href="/admin" className="block mt-6 text-xs text-gray-400">Panitia</a></div></main>}
