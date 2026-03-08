import { useState, useEffect } from 'react';
import { SiteRenderer } from './SiteRenderer';
import siteData from './site-data.json';
const businessName = "LifeInt";
const SITE_ID = "1769755449367";
const CHECK_URL = "https://foemfjmfrulilubshnwn.supabase.co/functions/v1/check-under-construction";

function UnderConstructionPage({ name, color }: { name: string; color: string }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,-apple-system,sans-serif',background:'#fafafa',color:'#1e293b',textAlign:'center',padding:'2rem'}}>
      <div style={{width:96,height:96,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'2rem',background:color+'20'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"/></svg>
      </div>
      <h1 style={{fontSize:'clamp(1.75rem,5vw,3rem)',fontWeight:700,marginBottom:'1rem'}}>{name}</h1>
      <p style={{fontSize:'1.125rem',color:'#64748b',maxWidth:'28rem',marginBottom:'2rem'}}>We're working on something amazing — check back soon!</p>
      <div style={{width:'6rem',height:4,borderRadius:4,background:color}}/>
    </div>
  );
}

export default function App() {
  const [uc, setUc] = useState<{active:boolean;name:string;color:string}|null>(null);
  useEffect(() => {
    fetch(CHECK_URL + '?site_id=' + SITE_ID)
      .then(r => r.json())
      .then(d => { if (d.underConstruction) setUc({active:true,name:d.businessName||businessName,color:d.primaryColor||'#dc2626'}); })
      .catch(() => {});
  }, []);
  if (uc?.active) return <UnderConstructionPage name={uc.name} color={uc.color} />;
  return <SiteRenderer content={siteData} businessName={businessName} />;
}