import { SiteRenderer } from './SiteRenderer';
import siteData from './site-data.json';
const businessName = "LifeInt";
export default function App() {
  return <SiteRenderer content={siteData} businessName={businessName} />;
}