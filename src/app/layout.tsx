import './globals.css'
import {Plus_Jakarta_Sans} from 'next/font/google'
const f=Plus_Jakarta_Sans({subsets:['latin'],weight:['400','500','600','700','800']})
export const metadata={title:'E-Voting PC IPM'}
export default function L({children}:{children:React.ReactNode}){return <html lang="id"><body className={f.className}>{children}</body></html>}
