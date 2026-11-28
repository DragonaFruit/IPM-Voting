'use client'
import {useEffect,useState} from 'react'
let shown=false // intro hanya sekali per buka halaman
// logo: alamat logo (null = belum siap) | ready: true bila data/foto sudah termuat
export default function Splash({logo,ready}:{logo:string|null,ready:boolean}){
 const [min,setMin]=useState(false);const [max,setMax]=useState(false);const [gone,setGone]=useState(shown)
 useEffect(()=>{const a=setTimeout(()=>setMin(true),2000),b=setTimeout(()=>setMax(true),8000);return()=>{clearTimeout(a);clearTimeout(b)}},[])
 const hide=(min&&ready)||max
 useEffect(()=>{if(!hide)return;const t=setTimeout(()=>{shown=true;setGone(true)},700);return()=>clearTimeout(t)},[hide])
 if(gone)return null
 return <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700" style={{opacity:hide?0:1,pointerEvents:hide?'none':'auto',background:'radial-gradient(circle at 20% 10%,#fffaf0,#fdeec9 70%)'}}>
  {logo&&<div className="neu w-40 h-40 rounded-[2.6rem] flex items-center justify-center animate-pulse"><img src={logo} alt="" className="w-28 h-28 object-contain"/></div>}</div>}
