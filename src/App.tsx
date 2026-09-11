import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SiteRenderer } from './SiteRenderer';
import fallbackData from './site-data.json';
import ezformsData from './ezforms-data.json';
const FALLBACK_BUSINESS_NAME = "LifeInt";
const SITE_ID = "1769755449367";
const SUPABASE_URL = "https://foemfjmfrulilubshnwn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZW1mam1mcnVsaWx1YnNobnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTgwMDgsImV4cCI6MjA4MDg5NDAwOH0.amehmaYIeVMh38QtQmvrLLaoravnPzzn4GUBPvPM_Pg";
const CHECK_URL = "https://foemfjmfrulilubshnwn.supabase.co/functions/v1/check-under-construction";

function LoadingScreen() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,-apple-system,sans-serif',background:'#fafafa',color:'#1e293b'}}>
      <div style={{textAlign:'center'}}>
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
        <p style={{color:'#64748b'}}>Loading site...</p>
      </div>
    </div>
  );
}

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

function updateMeta(site: any) {
  const title = site?.business_name || FALLBACK_BUSINESS_NAME;
  const desc = site?.seo_settings?.metaDescription || site?.content?.seo?.metaDescription || site?.business_name || FALLBACK_BUSINESS_NAME;
  const og = site?.seo_settings?.ogImage || site?.content?.hero?.heroImage || '';
  const setTag = (key: string, value: string, isProp = false) => {
    if (!value) return;
    const selector = (isProp ? 'meta[property="' : 'meta[name="') + key + '"]' as any;
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) { el = document.createElement('meta'); el.setAttribute(isProp ? 'property' : 'name', key); document.head.appendChild(el); }
    el.setAttribute('content', value);
  };
  document.title = title;
  setTag('description', desc);
  setTag('og:title', title, true);
  setTag('og:description', desc, true);
  setTag('og:type', 'website', true);
  setTag('og:image', og, true);
}

export default function App() {
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uc, setUc] = useState<{active:boolean;name:string;color:string}|null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CHECK_URL + '?site_id=' + SITE_ID)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.underConstruction) setUc({active:true,name:d.businessName||FALLBACK_BUSINESS_NAME,color:d.primaryColor||'#dc2626'}); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY };
    fetch(SUPABASE_URL + '/rest/v1/sites?id=eq.' + encodeURIComponent(SITE_ID) + '&status=eq.published&select=content,status,seo_settings,under_construction,business_name,slug', { headers })
      .then(r => { if (!r.ok) throw new Error('Failed to load live site'); return r.json(); })
      .then((rows: any[]) => {
        if (cancelled) return;
        const live = rows && rows[0];
        if (live) {
          setSite(live);
          updateMeta(live);
        } else {
          setError('Site is not published or unavailable.');
        }
      })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (uc?.active) return <UnderConstructionPage name={uc.name} color={uc.color} />;
  if (loading && !site) return <LoadingScreen />;
  const liveContent = site?.content || fallbackData;
  const liveBusinessName = site?.business_name || FALLBACK_BUSINESS_NAME;
  return <SiteRenderer content={liveContent} businessName={liveBusinessName} ezforms={ezformsData as any} />;
}