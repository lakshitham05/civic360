import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Compass,
  Crosshair,
  FileCheck2,
  FilePlus2,
  Filter,
  Gauge,
  HardHat,
  Home,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Plus,
  Radio,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { analyzeDemo, type AnalysisResult } from '@/lib/demo-ai';
import { domainConfigs, getDomain, type DomainConfig, type DomainKey, type Severity } from '@/lib/domain-config';
import { nextIncidentId, readStoredIncidents, writeStoredIncidents } from '@/lib/incident-store';
import { riskForIssue, severityTone } from '@/lib/risk-scoring';
import { recommendTeam, teams, type Team } from '@/lib/team-allocation';

type Role = 'citizen' | 'inspector' | 'admin';
type Page = 'dashboard' | 'monitor' | 'reports' | 'teams';
type IncidentStatus = 'Reported' | 'Under Inspection' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved';

type Incident = {
  id: string;
  domain: DomainKey;
  issue: string;
  location: string;
  date: string;
  time: string;
  severity: Severity;
  riskScore: number;
  recommendation: string;
  status: IncidentStatus;
  assignedTeam?: string;
  reporter: string;
  photo?: string;
  source: 'Citizen report' | 'Inspection';
};

type InspectionDraft = {
  location: string;
  issue: string;
  notes: string;
  photo: string;
  checklist: Record<string, boolean>;
};

const nowParts = () => {
  const date = new Date();
  return { date: date.toISOString().slice(0, 10), time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
};

const seedIncidents: Incident[] = [
  { id: 'INC-1024', domain: 'road-safety', issue: 'Pothole', location: 'Alder Avenue & 3rd', date: '2025-06-17', time: '09:42', severity: 'CRITICAL', riskScore: 44, recommendation: 'Place a temporary warning marker and schedule a patch crew before the next commuter peak.', status: 'Verified', reporter: 'M. Alvarez', source: 'Inspection' },
  { id: 'INC-1021', domain: 'street-light', issue: 'Light working', location: 'Rosewood Bus Stop', date: '2025-06-16', time: '21:18', severity: 'WARNING', riskScore: 68, recommendation: 'Dispatch an electrical maintenance crew before the next evening peak.', status: 'Assigned', assignedTeam: 'Brightpath Electrical', reporter: 'C. Mensah', source: 'Citizen report' },
  { id: 'INC-1018', domain: 'drainage', issue: 'Blockage', location: 'Juniper Lane Inlet', date: '2025-06-16', time: '14:06', severity: 'CRITICAL', riskScore: 57, recommendation: 'Clear the inlet and re-check water flow after the next rainfall.', status: 'In Progress', assignedTeam: 'Waterway Response', reporter: 'R. Singh', source: 'Inspection' },
  { id: 'INC-1014', domain: 'school', issue: 'Emergency exit', location: 'Cedar Grove Primary', date: '2025-06-15', time: '11:24', severity: 'SAFE', riskScore: 88, recommendation: 'Log a routine facilities follow-up and retain a clear exit path.', status: 'Resolved', assignedTeam: 'Northline Facilities', reporter: 'A. Brooks', source: 'Citizen report' },
  { id: 'INC-1009', domain: 'construction', issue: 'Fall hazard', location: 'Mason Street Renewal', date: '2025-06-14', time: '08:36', severity: 'CRITICAL', riskScore: 48, recommendation: 'Pause work at the east edge, restore the barrier, and confirm harness compliance.', status: 'Under Inspection', reporter: 'D. Okafor', source: 'Inspection' },
  { id: 'INC-1004', domain: 'college', issue: 'Laboratory safety', location: 'Rivermark Technical College', date: '2025-06-13', time: '16:50', severity: 'WARNING', riskScore: 73, recommendation: 'Clear corridor storage today and log a facilities follow-up for lab ventilation.', status: 'Reported', reporter: 'N. Patel', source: 'Citizen report' },
];

const storageKeys = { session: 'inspectiq-session', domain: 'inspectiq-domain', incidents: 'inspectiq-incidents' };

function App() {
  const [session, setSession] = useState<{ role: Role; name: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem(storageKeys.session) ?? 'null') as { role: Role; name: string } | null; } catch { return null; }
  });
  const [domainKey, setDomainKey] = useState<DomainKey | null>(() => localStorage.getItem(storageKeys.domain) as DomainKey | null);
  const [incidents, setIncidents] = useState<Incident[]>(() => readStoredIncidents(storageKeys.incidents, seedIncidents));
  const [page, setPage] = useState<Page>('dashboard');
  const [toast, setToast] = useState('');
  const [loginRole, setLoginRole] = useState<Role>('citizen');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => { writeStoredIncidents(storageKeys.incidents, incidents); }, [incidents]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const login = (role: Role, demo = false) => {
    const next = { role, name: demo ? (role === 'admin' ? 'Amina Okafor' : role === 'inspector' ? 'Daniel Mensah' : 'Maya Alvarez') : 'Jordan Lee' };
    localStorage.setItem(storageKeys.session, JSON.stringify(next));
    setSession(next);
  };
  const logout = () => { localStorage.removeItem(storageKeys.session); setSession(null); setDomainKey(null); localStorage.removeItem(storageKeys.domain); };
  const chooseDomain = (key: DomainKey) => { localStorage.setItem(storageKeys.domain, key); setDomainKey(key); setToast(`${getDomain(key).name} workspace ready`); };
  const changeDomain = () => { setDomainKey(null); localStorage.removeItem(storageKeys.domain); };
  const patchIncident = (id: string, patch: Partial<Incident>) => setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, ...patch } : incident));
  const addIncident = (incident: Incident) => { setIncidents((current) => [incident, ...current]); setToast(`${incident.id} created and added to the operations queue`); };

  if (!session) return <LoginScreen role={loginRole} setRole={setLoginRole} onLogin={login} />;
  if (!domainKey) return <DomainSelection role={session.role} name={session.name} onSelect={chooseDomain} onLogout={logout} />;

  const domain = getDomain(domainKey);
  return (
    <div className="noise min-h-[100dvh] bg-background">
      <AppShell
        role={session.role}
        name={session.name}
        domain={domain}
        page={page}
        setPage={(next) => { setPage(next); setMobileNav(false); }}
        onChangeDomain={changeDomain}
        onLogout={logout}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
      >
        {page === 'dashboard' && session.role === 'citizen' && <CitizenDashboard domain={domain} incidents={incidents} addIncident={addIncident} />}
        {page === 'dashboard' && session.role === 'inspector' && <InspectorDashboard domain={domain} addIncident={addIncident} setToast={setToast} />}
        {page === 'dashboard' && session.role === 'admin' && <AdminDashboard incidents={incidents} patchIncident={patchIncident} setToast={setToast} />}
        {page === 'monitor' && <Monitoring incidents={incidents} />}
        {page === 'reports' && <Reports incidents={incidents} role={session.role} />}
        {page === 'teams' && <TeamsView incidents={incidents} />}
      </AppShell>
      {toast && <div data-testid="status-toast" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl animate-rise"><Check size={16} />{toast}</div>}
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5" data-testid="brand-inspectiq">
    <div className="relative flex size-9 items-center justify-center rounded-xl bg-accent text-primary shadow-sm">
      <Crosshair size={20} strokeWidth={2.5} />
      <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
    </div>
    {!compact && <div><div className="font-mono-ui text-[15px] font-bold tracking-[.16em]">INSPECT<span className="text-accent">IQ</span></div><div className="text-[9px] uppercase tracking-[.2em] text-muted-foreground">action intelligence</div></div>}
  </div>;
}

function LoginScreen({ role, setRole, onLogin }: { role: Role; setRole: (role: Role) => void; onLogin: (role: Role, demo?: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <main className="grid min-h-[100dvh] bg-primary lg:grid-cols-[1.1fr_.9fr]">
    <section className="relative hidden overflow-hidden p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-40 -top-40 size-[620px] rounded-full border border-primary-foreground/10" />
      <div className="absolute -bottom-56 -left-36 size-[520px] rounded-full border border-accent/20" />
      <Logo />
      <div className="relative max-w-xl animate-rise">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.22em] text-accent"><span className="size-2 rounded-full bg-accent animate-pulse-dot" />Municipal operations, made visible</div>
        <h1 className="max-w-lg text-6xl font-semibold leading-[.98] tracking-[-.06em]">From report<br /><span className="text-accent">to resolution.</span></h1>
        <p className="mt-7 max-w-md text-base leading-7 text-primary-foreground/65">InspectIQ turns local observations into verified, assigned, and resolved action — with every handoff in view.</p>
      </div>
      <div className="relative flex items-center gap-8 text-xs text-primary-foreground/55"><span>06 domains</span><span className="h-px w-12 bg-primary-foreground/20" /><span>One trusted queue</span></div>
    </section>
    <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
      <div className="w-full max-w-[430px] animate-rise">
        <div className="mb-10 lg:hidden"><Logo /></div>
        <div className="mb-8"><div className="mb-3 inline-flex rounded-full border border-border bg-card px-3 py-1 font-mono-ui text-[10px] uppercase tracking-[.2em] text-muted-foreground">Operations cockpit</div><h2 className="text-3xl font-semibold tracking-[-.04em]">Welcome back.</h2><p className="mt-2 text-sm text-muted-foreground">Smart Inspection. Faster Action. Safer Communities.</p></div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold">Email address<input data-testid="input-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@city.gov" type="email" className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-accent/15" /></label>
          <label className="block text-sm font-semibold">Password<input data-testid="input-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" type="password" className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-accent/15" /></label>
          <button data-testid="button-login" onClick={() => onLogin(role)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:-translate-y-0.5 hover:shadow-lg">Log in <ArrowRight size={16} /></button>
          <button data-testid="button-demo-login" onClick={() => onLogin(role, true)} className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-foreground hover:border-accent hover:bg-accent/10">Use demo workspace</button>
        </div>
        <div className="mt-9 border-t border-border pt-6"><p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Demo role</p><div className="grid grid-cols-3 gap-2">
          {([['citizen', 'Citizen / User'], ['inspector', 'Inspector'], ['admin', 'Admin / Allocator']] as [Role, string][]).map(([key, label]) => <button data-testid={`button-role-${key}`} key={key} onClick={() => setRole(key)} className={`rounded-xl border px-2 py-3 text-center text-[11px] font-semibold ${role === key ? 'border-accent bg-accent/15 text-foreground' : 'border-border bg-card text-muted-foreground hover:border-accent'}`}><span className={`mx-auto mb-2 block size-2 rounded-full ${role === key ? 'bg-accent' : 'bg-muted'}`} />{label}</button>)}
        </div><p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">Demo mode uses local browser storage. No real account or API connection required.</p></div>
      </div>
    </section>
  </main>;
}

function DomainSelection({ role, name, onSelect, onLogout }: { role: Role; name: string; onSelect: (key: DomainKey) => void; onLogout: () => void }) {
  return <main className="min-h-[100dvh] bg-background px-5 py-6 sm:px-10 sm:py-10">
    <header className="mx-auto flex max-w-6xl items-center justify-between"><Logo /><button data-testid="button-logout" onClick={onLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"><LogOut size={15} /> Sign out</button></header>
    <section className="mx-auto max-w-6xl pt-14 sm:pt-20"><div className="max-w-2xl animate-rise"><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground"><span className="size-2 rounded-full bg-accent" /> {role === 'admin' ? 'Allocation desk' : role === 'inspector' ? 'Field workspace' : 'Community portal'}</div><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Good morning, {name.split(' ')[0]}.<br /><span className="text-muted-foreground">What are we looking after?</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground">Choose a working domain. InspectIQ will tune the reports, checks, recommendations, and team matches around it.</p></div>
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{domainConfigs.map((domain, index) => <DomainCard key={domain.key} domain={domain} index={index} onSelect={onSelect} />)}</div>
    </section>
  </main>;
}

function DomainCard({ domain, index, onSelect }: { domain: DomainConfig; index: number; onSelect: (key: DomainKey) => void }) {
  const Icon = domain.icon;
  return <button data-testid={`card-domain-${domain.key}`} onClick={() => onSelect(domain.key)} className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${domain.tint} p-5 text-left shadow-sm animate-rise animate-rise-${Math.min(index % 3 + 1, 3)} hover:-translate-y-1 hover:border-accent hover:shadow-md`}>
    <div className="flex items-start justify-between"><div className="flex size-11 items-center justify-center rounded-xl bg-card/75 text-primary shadow-sm"><Icon size={22} /></div><span className="flex size-6 items-center justify-center rounded-full border border-primary/20 bg-card/40 text-primary opacity-0 transition-opacity group-hover:opacity-100"><ArrowRight size={13} /></span></div>
    <h2 className="mt-7 text-lg font-bold">{domain.name}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-primary/55">{domain.short}</p><p className="mt-4 max-w-xs text-sm leading-5 text-primary/70">{domain.description}</p>
  </button>;
}

function AppShell({ role, name, domain, page, setPage, onChangeDomain, onLogout, mobileNav, setMobileNav, children }: { role: Role; name: string; domain: DomainConfig; page: Page; setPage: (page: Page) => void; onChangeDomain: () => void; onLogout: () => void; mobileNav: boolean; setMobileNav: (open: boolean) => void; children: React.ReactNode }) {
  const RoleIcon = role === 'admin' ? Users : role === 'inspector' ? ClipboardCheck : Compass;
  const nav: [Page, string, LucideIcon][] = [['dashboard', 'Overview', Home], ['monitor', 'Live monitor', Radio], ['reports', 'Incident log', FileCheck2], ['teams', 'Teams', Users]];
  const DomainIcon = domain.icon;
  return <div className="flex min-h-[100dvh]">
    <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform md:sticky md:top-0 md:flex md:h-[100dvh] md:translate-x-0 md:flex-col ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2"><Logo /><button data-testid="button-close-nav" onClick={() => setMobileNav(false)} className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent md:hidden"><X size={18} /></button></div>
      <div className="mt-9 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-3"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"><DomainIcon size={20} /></div><div className="min-w-0"><p className="truncate text-sm font-bold">{domain.name}</p><p className="text-[10px] uppercase tracking-[.14em] text-sidebar-foreground/55">Active domain</p></div></div><button data-testid="button-change-domain" onClick={onChangeDomain} className="mt-3 flex w-full items-center justify-between rounded-lg border border-sidebar-border px-2.5 py-2 text-[11px] font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent">Change domain <ChevronDown size={13} /></button></div>
      <div className="mt-8 flex-1"><p className="px-2 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Workspace</p><nav className="mt-3 space-y-1">{nav.map(([key, label, Icon]) => <button data-testid={`nav-${key}`} key={key} onClick={() => setPage(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === key ? 'bg-accent text-primary shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}><Icon size={17} />{label}{key === 'monitor' && <span className="ml-auto flex size-2 rounded-full bg-emerald-400 animate-pulse-dot" />}</button>)}</nav></div>
      <div className="border-t border-sidebar-border pt-4"><div className="flex items-center gap-3 px-2"><div className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent font-mono-ui text-xs font-bold text-accent">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-[11px] capitalize text-sidebar-foreground/50">{role === 'admin' ? 'Admin / Allocator' : role}</p></div><button data-testid="button-sidebar-logout" onClick={onLogout} className="rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"><LogOut size={15} /></button></div></div>
    </aside>
    {mobileNav && <button data-testid="button-nav-overlay" aria-label="Close navigation" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-primary/30 md:hidden" />}
    <main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8"><div className="flex items-center gap-3"><button data-testid="button-open-nav" onClick={() => setMobileNav(true)} className="rounded-lg p-2 hover:bg-muted md:hidden"><Menu size={20} /></button><div className="md:hidden"><Logo compact /></div><div className="hidden items-center gap-2 text-sm md:flex"><span className="text-muted-foreground">Workspace</span><span className="text-border">/</span><span className="font-bold">{domain.name}</span></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" /> Live monitoring</div><button data-testid="button-notifications" className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Bell size={18} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" /></button></div></header><div className="mx-auto max-w-[1480px] p-4 sm:p-8">{children}</div></main>
  </div>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-muted-foreground"><span className="size-1.5 rounded-full bg-accent" />{eyebrow}</p><h1 className="text-3xl font-semibold tracking-[-.05em] sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}

function StatCard({ label, value, detail, icon: Icon, tone = 'default' }: { label: string; value: string | number; detail: string; icon: LucideIcon; tone?: 'default' | 'critical' | 'safe' | 'accent' }) {
  const colors = { default: 'bg-card', critical: 'bg-red-50 border-red-100', safe: 'bg-emerald-50 border-emerald-100', accent: 'bg-accent/15 border-accent/25' };
  return <div data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`} className={`rounded-2xl border border-card-border p-4 shadow-sm ${colors[tone]}`}><div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</p><Icon size={16} className="text-muted-foreground" /></div><div className="mt-4 flex items-end justify-between"><p className="font-mono-ui text-3xl font-bold tracking-[-.08em]">{value}</p><p className="text-right text-[11px] font-semibold text-muted-foreground">{detail}</p></div></div>;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const tone = severityTone(severity);
  return <span data-testid={`status-severity-${severity.toLowerCase()}`} className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${tone.className}`}><span className={`size-1.5 rounded-full ${tone.dot}`} />{tone.label}</span>;
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const safe = status === 'Resolved';
  const active = status === 'In Progress' || status === 'Assigned';
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${safe ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : active ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-border bg-muted text-muted-foreground'}`}>{status}</span>;
}

function IncidentRow({ incident, action }: { incident: Incident; action?: React.ReactNode }) {
  const domain = getDomain(incident.domain);
  const Icon = domain.icon;
  return <div data-testid={`row-incident-${incident.id}`} className="flex flex-col gap-3 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary"><Icon size={17} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono-ui text-xs font-bold text-primary">{incident.id}</span><SeverityBadge severity={incident.severity} /></div><p className="mt-1 truncate text-sm font-bold">{incident.issue} <span className="font-normal text-muted-foreground">· {domain.name}</span></p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} />{incident.location}<span className="mx-1">·</span>{incident.date}</p></div></div><div className="flex items-center justify-between gap-3 pl-12 sm:justify-end sm:pl-0"><div className="text-right"><StatusBadge status={incident.status} />{incident.assignedTeam && <p className="mt-1 text-[10px] text-muted-foreground">{incident.assignedTeam}</p>}</div>{action}</div></div>;
}

function CitizenDashboard({ domain, incidents, addIncident }: { domain: DomainConfig; incidents: Incident[]; addIncident: (incident: Incident) => void }) {
  const [form, setForm] = useState({ issue: domain.issues[0], description: '', location: domain.sampleLocations[0], photo: '' });
  const [coords, setCoords] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const own = incidents.filter((incident) => incident.source === 'Citizen report');
  const report = () => {
    if (!form.description.trim() || !form.location.trim()) return;
    const parts = nowParts();
    const risk = riskForIssue(form.issue, domain.key);
    const incident: Incident = { id: nextIncidentId(incidents.length), domain: domain.key, issue: form.issue, location: form.location, date: parts.date, time: parts.time, severity: risk.severity, riskScore: risk.score, recommendation: domain.recommendation, status: 'Reported', reporter: 'You', source: 'Citizen report', photo: form.photo };
    addIncident(incident); setSubmitted(true); setForm({ issue: domain.issues[0], description: '', location: domain.sampleLocations[0], photo: '' });
  };
  const useLocation = () => {
    if (!navigator.geolocation) { setCoords('Location unavailable in this browser'); return; }
    navigator.geolocation.getCurrentPosition((position) => setCoords(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`), () => setCoords('Location permission was not granted'));
  };
  return <div className="space-y-7 animate-rise"><PageIntro eyebrow="Community desk" title={`Keep ${domain.name.toLowerCase()} moving.`} description="Submit a clear observation and follow every handoff until the issue is resolved." action={<div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><span className="size-2 rounded-full bg-emerald-500 animate-pulse-dot" /> Your reports are tracked</div>} />
    <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Submitted" value={own.length + 18} detail="this month" icon={Send} tone="accent" /><StatCard label="Open" value={own.filter((item) => item.status !== 'Resolved').length + 3} detail="being handled" icon={Clock3} /><StatCard label="Resolved" value={own.filter((item) => item.status === 'Resolved').length + 12} detail="last 90 days" icon={Check} tone="safe" /></div>
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Report an issue</h2><p className="mt-1 text-xs text-muted-foreground">A precise report helps the right team move sooner.</p></div><div className="rounded-xl bg-accent/15 p-2.5 text-primary"><FilePlus2 size={19} /></div></div>{submitted && <div data-testid="status-report-success" className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><Check size={17} className="mt-0.5 shrink-0" /><div><p className="font-bold">Report received.</p><p className="mt-1 text-xs">Your incident ID is in the incident log. Keep it handy for follow-up.</p></div><button data-testid="button-dismiss-success" onClick={() => setSubmitted(false)} className="ml-auto"><X size={15} /></button></div>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Issue type<select data-testid="select-issue-type" value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent">{domain.issues.map((issue) => <option key={issue}>{issue}</option>)}</select></label><label className="text-xs font-bold">Location<input data-testid="input-report-location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent" /></label></div>
      <label className="mt-4 block text-xs font-bold">What did you notice?<textarea data-testid="input-report-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} placeholder={`Describe the ${domain.name.toLowerCase()} issue...`} className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent" /></label>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-background p-3 hover:border-accent"><Camera size={18} className="text-muted-foreground" /><span className="min-w-0 flex-1 text-xs font-semibold"><span className="block">Add photo evidence</span><span className="font-normal text-muted-foreground">{form.photo || 'Optional · JPG or PNG'}</span></span><input data-testid="input-report-photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => setForm({ ...form, photo: event.target.files?.[0]?.name ?? '' })} /></label><button data-testid="button-use-location" onClick={useLocation} className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-xs font-bold hover:border-accent"><Navigation size={15} /> Use current location</button></div>{coords && <p data-testid="text-report-coordinates" className="mt-2 font-mono-ui text-[10px] text-muted-foreground">Coordinates recorded: {coords}</p>}
      <button data-testid="button-submit-report" onClick={report} disabled={!form.description.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:-translate-y-0.5"><Send size={16} /> Submit report</button>
    </section><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Recent reports</h2><p className="mt-1 text-xs text-muted-foreground">Your latest signal through the queue.</p></div><button data-testid="button-view-all-reports" className="text-xs font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">View all</button></div><div className="mt-3">{own.slice(0, 4).map((incident) => <IncidentRow key={incident.id} incident={incident} />)}</div></section></div>
    <Timeline />
  </div>;
}

function Timeline() {
  const states: [string, string][] = [['Reported', 'A report enters the shared queue'], ['Under Inspection', 'A field inspector checks the signal'], ['Verified', 'Evidence and risk are confirmed'], ['Assigned', 'The best available team is selected'], ['In Progress', 'Work is actively underway'], ['Resolved', 'The issue is closed with a record']];
  return <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">How a report moves</h2><p className="mt-1 text-xs text-muted-foreground">A shared language from signal to close-out.</p></div><Activity size={19} className="text-accent" /></div><div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{states.map(([state, label], index) => <div data-testid={`timeline-step-${index}`} key={state} className="relative rounded-xl bg-muted/60 p-3"><div className={`mb-3 flex size-7 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-accent text-primary' : 'bg-card text-muted-foreground'}`}>{index + 1}</div><p className="text-xs font-bold">{state}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{label}</p>{index < states.length - 1 && <ArrowRight size={13} className="absolute -right-2 top-6 z-10 hidden text-border lg:block" />}</div>)}</div></section>;
}

function InspectorDashboard({ domain, addIncident, setToast }: { domain: DomainConfig; addIncident: (incident: Incident) => void; setToast: (message: string) => void }) {
  const [inspection, setInspection] = useState<InspectionDraft | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const start = () => setInspection({ location: domain.sampleLocations[0], issue: domain.issues[0], notes: '', photo: '', checklist: Object.fromEntries(domain.checklist.map((item) => [item, false])) });
  const runAnalysis = () => {
    if (!inspection) return;
    setBusy(true);
    window.setTimeout(() => { setAnalysis(analyzeDemo(domain.key, inspection.issue)); setBusy(false); }, 650);
  };
  const createFromAnalysis = () => {
    if (!inspection || !analysis) return;
    const parts = nowParts();
    addIncident({ id: `INC-${1025 + Math.floor(Math.random() * 70)}`, domain: domain.key, issue: inspection.issue, location: inspection.location, date: parts.date, time: parts.time, severity: analysis.severity, riskScore: analysis.safetyScore, recommendation: analysis.recommendation, status: 'Verified', reporter: 'Daniel Mensah', source: 'Inspection', photo: inspection.photo });
    setInspection(null); setAnalysis(null);
  };
  if (inspection) return <InspectionFlow domain={domain} inspection={inspection} setInspection={setInspection} analysis={analysis} setAnalysis={setAnalysis} busy={busy} runAnalysis={runAnalysis} createFromAnalysis={createFromAnalysis} />;
  return <div className="space-y-7 animate-rise"><PageIntro eyebrow="Field operations" title={`${domain.name} inspection desk`} description="Capture consistent evidence in the field, then let a transparent demo analysis shape the next action." action={<button data-testid="button-start-inspection" onClick={start} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:-translate-y-0.5"><Plus size={17} /> Start inspection</button>} />
    <div className="grid gap-3 sm:grid-cols-4"><StatCard label="Pending" value="12" detail="in your queue" icon={ClipboardCheck} /><StatCard label="Today" value="07" detail="scheduled" icon={Clock3} tone="accent" /><StatCard label="Critical" value="03" detail="needs attention" icon={ShieldAlert} tone="critical" /><StatCard label="Completed" value="48" detail="this month" icon={Check} tone="safe" /></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]"><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Today’s route</h2><p className="mt-1 text-xs text-muted-foreground">Prioritized by risk, proximity, and age.</p></div><button data-testid="button-route-filter" className="rounded-lg border border-border p-2 text-muted-foreground hover:border-accent"><Filter size={15} /></button></div><div className="mt-3">{[['Cedar Grove Primary', 'Emergency exit', '09:20', 'CRITICAL'], ['Lakeview Public School', 'Electrical safety', '11:45', 'WARNING'], ['North Ward Learning Centre', 'Cleanliness/obstruction', '14:10', 'SAFE']].map(([location, issue, time, severity]) => <div data-testid={`route-stop-${location}`} key={location} className="flex items-center gap-3 border-b border-border py-4 last:border-0"><div className="font-mono-ui text-xs font-bold text-muted-foreground">{time}</div><div className="h-9 w-px bg-border" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{location}</p><p className="mt-1 text-xs text-muted-foreground">{issue}</p></div><SeverityBadge severity={severity as Severity} /></div>)}</div></section><section className="panel-grid relative overflow-hidden rounded-2xl border border-primary/20 bg-primary p-5 text-primary-foreground shadow-sm sm:p-6"><div className="absolute -right-12 -top-14 size-48 rounded-full border border-primary-foreground/10" /><div className="relative"><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-accent">Inspection protocol</p><h2 className="mt-5 max-w-xs text-2xl font-semibold leading-tight">One checklist.<br />Every critical detail.</h2><p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/60">Domain-specific checks keep field evidence consistent across every site and shift.</p><div className="mt-8 flex items-center gap-3"><div className="flex -space-x-2">{['AM', 'DK', 'RS'].map((initials) => <span key={initials} className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-sidebar-accent font-mono-ui text-[9px] font-bold text-accent">{initials}</span>)}</div><span className="text-xs text-primary-foreground/60">12 inspectors active</span></div></div></section></div>
  </div>;
}

function InspectionFlow({ domain, inspection, setInspection, analysis, setAnalysis, busy, runAnalysis, createFromAnalysis }: { domain: DomainConfig; inspection: InspectionDraft; setInspection: (value: InspectionDraft | null) => void; analysis: AnalysisResult | null; setAnalysis: (value: AnalysisResult | null) => void; busy: boolean; runAnalysis: () => void; createFromAnalysis: () => void }) {
  const update = (patch: Partial<InspectionDraft>) => setInspection({ ...inspection, ...patch });
  return <div className="space-y-6 animate-rise"><button data-testid="button-back-inspection" onClick={() => setInspection(null)} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Back to inspection desk</button><PageIntro eyebrow="New inspection" title={`Inspecting ${domain.name.toLowerCase()}`} description="Record what is true on site. The demo analyzer only assists — you remain the decision-maker." /><div className="grid gap-6 xl:grid-cols-[1fr_.85fr]"><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Field capture</h2><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground">Step 01 / 02</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Site / location<input data-testid="input-inspection-location" value={inspection.location} onChange={(event) => update({ location: event.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent" /></label><label className="text-xs font-bold">Issue category<select data-testid="select-inspection-issue" value={inspection.issue} onChange={(event) => update({ issue: event.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent">{domain.issues.map((issue) => <option key={issue}>{issue}</option>)}</select></label></div><div className="mt-6"><p className="text-xs font-bold">Domain checklist</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{domain.checklist.map((item) => <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-semibold ${inspection.checklist[item] ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-border bg-background'}`}><input data-testid={`checkbox-checklist-${item}`} type="checkbox" checked={inspection.checklist[item]} onChange={(event) => update({ checklist: { ...inspection.checklist, [item]: event.target.checked } })} className="size-4 accent-emerald-600" />{item}<span className="ml-auto">{inspection.checklist[item] && <Check size={14} />}</span></label>)}</div></div><label className="mt-6 block text-xs font-bold">Inspector notes<textarea data-testid="input-inspection-notes" value={inspection.notes} onChange={(event) => update({ notes: event.target.value })} rows={4} placeholder="Add a concise field note..." className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent" /></label><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-background p-3 hover:border-accent"><Camera size={18} className="text-muted-foreground" /><span className="text-xs font-semibold"><span className="block">Capture evidence</span><span className="font-normal text-muted-foreground">{inspection.photo || 'Camera or image upload'}</span></span><input data-testid="input-inspection-photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => update({ photo: event.target.files?.[0]?.name ?? '' })} /></label><div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 text-xs"><MapPin size={17} className="text-accent" /><span><span className="block font-bold">Location & time recorded</span><span className="text-muted-foreground">GPS available · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span></div></div><button data-testid="button-analyze-inspection" onClick={runAnalysis} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-70">{busy ? <><Loader2 size={16} className="animate-spin" /> Reading evidence...</> : <><Sparkles size={16} /> Analyze inspection</>}</button></section><AnalysisPanel analysis={analysis} busy={busy} onCreate={createFromAnalysis} onReset={() => setAnalysis(null)} /></div></div>;
}

function AnalysisPanel({ analysis, busy, onCreate, onReset }: { analysis: AnalysisResult | null; busy: boolean; onCreate: () => void; onReset: () => void }) {
  if (busy) return <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary p-6 text-primary-foreground shadow-sm"><div className="absolute left-0 top-0 h-1 w-1/3 bg-accent scan-line" /><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-accent">Demo analysis running</p><div className="mt-14"><div className="h-3 w-4/5 rounded-full bg-primary-foreground/15" /><div className="mt-4 h-3 w-3/5 rounded-full bg-primary-foreground/15" /><div className="mt-4 h-3 w-2/3 rounded-full bg-primary-foreground/15" /></div><p className="mt-14 text-sm text-primary-foreground/60">Comparing evidence against the {analysis ? 'domain' : 'domain'} protocol…</p></section>;
  if (!analysis) return <section className="panel-grid flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 p-6 text-center"><div className="flex size-14 items-center justify-center rounded-2xl bg-accent/20 text-primary"><Sparkles size={25} /></div><h2 className="mt-5 text-lg font-bold">Analysis will appear here</h2><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Complete the field capture, then run the clearly labelled demo analysis to surface risk and next action.</p></section>;
  return <section data-testid="panel-analysis-result" className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><Sparkles size={17} className="text-accent" /><h2 className="text-lg font-bold">Analysis result</h2></div><p className="mt-2 inline-flex rounded-full bg-accent/15 px-2 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[.15em] text-primary">Demo / mock analysis · not a trained model</p></div><button data-testid="button-reset-analysis" onClick={onReset} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X size={16} /></button></div><div className="mt-6 flex items-center gap-4 rounded-2xl bg-muted/60 p-4"><div className="relative flex size-20 shrink-0 items-center justify-center rounded-full border-[7px] border-amber-300 bg-card"><span className="font-mono-ui text-xl font-bold">{analysis.safetyScore}</span></div><div><p className="text-xs text-muted-foreground">Safety score</p><div className="mt-1"><SeverityBadge severity={analysis.severity} /></div><p className="mt-2 text-[10px] text-muted-foreground">80–100 safe · 60–79 warning · 0–59 critical</p></div></div><div className="mt-6 space-y-4"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Issue detected</p><p className="mt-1 text-sm font-bold">{analysis.issueDetected}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Confidence</p><div className="mt-2 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${analysis.confidence}%` }} /></div><span className="font-mono-ui text-xs font-bold">{analysis.confidence}%</span></div></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Findings</p><ul className="mt-2 space-y-2">{analysis.findings.map((finding) => <li key={finding} className="flex gap-2 text-xs leading-5"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />{finding}</li>)}</ul></div><div className="rounded-xl border border-accent/30 bg-accent/10 p-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary/65">Recommended next action</p><p className="mt-1 text-xs font-semibold leading-5">{analysis.recommendation}</p></div></div><button data-testid="button-create-incident" onClick={onCreate} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground"><FileCheck2 size={16} /> Create verified incident</button></section>;
}

function AdminDashboard({ incidents, patchIncident, setToast }: { incidents: Incident[]; patchIncident: (id: string, patch: Partial<Incident>) => void; setToast: (message: string) => void }) {
  const pending = incidents.filter((incident) => !incident.assignedTeam && incident.status !== 'Resolved');
  const assign = (incident: Incident) => { const team = recommendTeam(incident.domain, incident.severity); patchIncident(incident.id, { assignedTeam: team.name, status: 'Assigned' }); setToast(`${incident.id} assigned to ${team.name}`); };
  const advance = (incident: Incident) => { const next: IncidentStatus = incident.status === 'Assigned' ? 'In Progress' : 'Resolved'; patchIncident(incident.id, { status: next }); setToast(`${incident.id} marked ${next.toLowerCase()}`); };
  return <div className="space-y-7 animate-rise"><PageIntro eyebrow="Allocation desk" title="Turn verified issues into action." description="Review the live queue, find the best available team, and keep work moving through close-out." action={<div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><Radio size={14} /> Live queue synced</div>} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><StatCard label="Total incidents" value={incidents.length} detail="all domains" icon={Gauge} /><StatCard label="Critical" value={incidents.filter((item) => item.severity === 'CRITICAL').length} detail="priority queue" icon={ShieldAlert} tone="critical" /><StatCard label="Pending allocation" value={pending.length} detail="need a team" icon={Target} tone="accent" /><StatCard label="In progress" value={incidents.filter((item) => item.status === 'In Progress').length} detail="on the ground" icon={HardHat} /><StatCard label="Resolved" value={incidents.filter((item) => item.status === 'Resolved').length} detail="closed records" icon={Check} tone="safe" /></div><div className="grid gap-6 xl:grid-cols-[1fr_.75fr]"><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Allocation queue</h2><p className="mt-1 text-xs text-muted-foreground">Prioritized by risk score and response status.</p></div><button data-testid="button-search-queue" className="rounded-lg border border-border p-2 text-muted-foreground hover:border-accent"><Search size={15} /></button></div><div className="mt-3">{incidents.slice(0, 6).map((incident) => <IncidentRow key={incident.id} incident={incident} action={incident.status === 'Resolved' ? null : incident.assignedTeam ? <button data-testid={`button-advance-${incident.id}`} onClick={() => advance(incident)} className="rounded-lg bg-primary px-2.5 py-2 text-[10px] font-bold text-primary-foreground">{incident.status === 'Assigned' ? 'Start work' : 'Close out'}</button> : <button data-testid={`button-find-team-${incident.id}`} onClick={() => assign(incident)} className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 text-[10px] font-bold text-primary"><Target size={13} /> Find best team</button>} />)}</div></section><TeamRecommendation incidents={incidents} /></div></div>;
}

function TeamRecommendation({ incidents }: { incidents: Incident[] }) {
  const [selected, setSelected] = useState<Incident | null>(incidents.find((incident) => !incident.assignedTeam) ?? incidents[0] ?? null);
  const team = selected ? recommendTeam(selected.domain, selected.severity) : teams[0];
  return <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Matching engine</p><h2 className="mt-2 text-lg font-bold">Best team signals</h2></div><div className="rounded-xl bg-accent/15 p-2.5"><Target size={18} /></div></div><label className="mt-6 block text-xs font-bold">Preview an incident<select data-testid="select-team-incident" value={selected?.id ?? ''} onChange={(event) => setSelected(incidents.find((incident) => incident.id === event.target.value) ?? null)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent">{incidents.map((incident) => <option value={incident.id} key={incident.id}>{incident.id} · {incident.issue}</option>)}</select></label><div className="mt-5 rounded-2xl bg-primary p-4 text-primary-foreground"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-primary-foreground/55">Recommended</p><p data-testid="text-recommended-team" className="mt-2 text-lg font-bold">{team.name}</p></div><div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"><Users size={19} /></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-primary-foreground/15 pt-4 text-center"><div><p className="font-mono-ui text-sm font-bold">{team.distance}</p><p className="mt-1 text-[9px] text-primary-foreground/55">distance</p></div><div><p className="font-mono-ui text-sm font-bold">{team.workload}</p><p className="mt-1 text-[9px] text-primary-foreground/55">open jobs</p></div><div><p className="text-[11px] font-bold">{team.availability.replace('Available ', '')}</p><p className="mt-1 text-[9px] text-primary-foreground/55">availability</p></div></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Recommendation combines domain skill match, availability, approximate distance, and current workload. Allocators remain in control.</p></section>;
}

function Monitoring({ incidents }: { incidents: Incident[] }) {
  const [filter, setFilter] = useState<'all' | DomainKey>('all');
  const filtered = filter === 'all' ? incidents : incidents.filter((incident) => incident.domain === filter);
  return <div className="space-y-7 animate-rise"><PageIntro eyebrow="Situational awareness" title="Live monitoring" description="A calm, map-style view of the signals moving through your six operating domains." action={<div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><span className="size-2 rounded-full bg-emerald-500 animate-pulse-dot" /> 24 signals online</div>} /><div className="flex gap-2 overflow-x-auto pb-1">{[['all', 'All domains'], ...domainConfigs.map((domain) => [domain.key, domain.name])].map(([key, label]) => <button data-testid={`button-filter-${key}`} key={key} onClick={() => setFilter(key as 'all' | DomainKey)} className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold ${filter === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-accent'}`}>{label}</button>)}</div><div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section className="panel-grid relative min-h-[470px] overflow-hidden rounded-2xl border border-card-border bg-[#dfe8e2] shadow-sm"><div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(32deg, transparent 48%, rgba(34,58,65,.15) 49%, rgba(34,58,65,.15) 51%, transparent 52%), linear-gradient(125deg, transparent 48%, rgba(34,58,65,.12) 49%, rgba(34,58,65,.12) 51%, transparent 52%)', backgroundSize: '160px 160px' }} /><div className="absolute left-[15%] top-[20%] h-[3px] w-[55%] rotate-[18deg] bg-[#93aaa0]/70" /><div className="absolute left-[35%] top-[59%] h-[3px] w-[65%] -rotate-[12deg] bg-[#93aaa0]/70" /><div className="absolute left-[5%] top-[46%] h-[3px] w-[80%] rotate-[3deg] bg-[#93aaa0]/70" /><div className="absolute left-4 top-4 rounded-xl border border-border/70 bg-card/85 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground backdrop-blur">North district · field view</div>{filtered.slice(0, 8).map((incident, index) => <div key={incident.id} data-testid={`map-marker-${incident.id}`} className="group absolute" style={{ left: `${15 + ((index * 19) % 70)}%`, top: `${21 + ((index * 23) % 57)}%` }}><div className={`flex size-8 items-center justify-center rounded-full border-4 border-card shadow-md transition-transform group-hover:scale-125 ${severityTone(incident.severity).dot}`}><MapPin size={15} className="text-card" fill="currentColor" /></div><div className="pointer-events-none absolute bottom-10 left-1/2 hidden w-44 -translate-x-1/2 rounded-xl bg-primary p-3 text-primary-foreground shadow-xl group-hover:block"><p className="font-mono-ui text-[10px] text-accent">{incident.id}</p><p className="mt-1 text-xs font-bold">{incident.issue}</p><p className="mt-1 text-[10px] text-primary-foreground/60">{incident.location}</p></div></div>)}<div className="absolute bottom-4 left-4 flex flex-wrap gap-3 rounded-xl border border-border/70 bg-card/90 px-3 py-2.5 text-[10px] font-bold backdrop-blur"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-red-500" /> Critical</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" /> Warning</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500" /> Safe</span></div></section><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Signals nearby</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} visible incident records</p></div><button data-testid="button-center-map" className="rounded-lg border border-border p-2 text-muted-foreground hover:border-accent"><Crosshair size={15} /></button></div><div className="mt-3">{filtered.slice(0, 5).map((incident) => <IncidentRow key={incident.id} incident={incident} />)}</div></section></div></div>;
}

function Reports({ incidents, role }: { incidents: Incident[]; role: Role }) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState<'all' | Severity>('all');
  const filtered = useMemo(() => incidents.filter((incident) => `${incident.id} ${incident.issue} ${incident.location}`.toLowerCase().includes(query.toLowerCase()) && (severity === 'all' || incident.severity === severity)), [incidents, query, severity]);
  return <div className="space-y-7 animate-rise"><PageIntro eyebrow="Record book" title="Incident log" description={`${incidents.length} records across all six domains. Every report retains its source, owner, risk, and next action.`} action={<div className="font-mono-ui text-xs text-muted-foreground">{role === 'admin' ? 'Allocator view' : 'Read-only history'}</div>} /><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={15} className="absolute left-3 top-3.5 text-muted-foreground" /><input data-testid="input-search-incidents" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search incident, issue, or location" className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-3 text-sm outline-none focus:border-accent" /></label><select data-testid="select-severity-filter" value={severity} onChange={(event) => setSeverity(event.target.value as 'all' | Severity)} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-accent"><option value="all">All severities</option><option value="CRITICAL">Critical</option><option value="WARNING">Warning</option><option value="SAFE">Safe</option></select></div><div className="mt-5">{filtered.map((incident) => <IncidentRow key={incident.id} incident={incident} />)}{filtered.length === 0 && <div data-testid="empty-incidents" className="flex flex-col items-center py-16 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-muted"><Search size={21} className="text-muted-foreground" /></div><h3 className="mt-4 font-bold">No matching incidents</h3><p className="mt-1 text-sm text-muted-foreground">Try a different issue, location, or severity.</p></div>}</div></section></div>;
}

function TeamsView({ incidents }: { incidents: Incident[] }) {
  return <div className="space-y-7 animate-rise"><PageIntro eyebrow="People and capacity" title="Response teams" description="A shared view of skill coverage, current workload, and assignment readiness." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{teams.map((team) => <div data-testid={`card-team-${team.id}`} key={team.id} className="rounded-2xl border border-card-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-accent"><Users size={18} /></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${team.availability.includes('now') || team.availability === 'On call' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{team.availability}</span></div><h2 className="mt-5 font-bold">{team.name}</h2><p className="mt-1 text-xs text-muted-foreground">{team.distance} from central depot · {team.workload} open jobs</p><div className="mt-5 flex flex-wrap gap-1.5">{team.domains.map((key) => <span key={key} className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold">{getDomain(key).name}</span>)}</div></div>)}</div><section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold">Assignment health</h2><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-muted/60 p-4"><p className="text-xs font-bold text-muted-foreground">Coverage</p><p className="mt-2 font-mono-ui text-2xl font-bold">6 / 6</p><p className="mt-1 text-[11px] text-muted-foreground">domains covered</p></div><div className="rounded-xl bg-muted/60 p-4"><p className="text-xs font-bold text-muted-foreground">Unassigned</p><p className="mt-2 font-mono-ui text-2xl font-bold">{incidents.filter((incident) => !incident.assignedTeam).length}</p><p className="mt-1 text-[11px] text-muted-foreground">need a match</p></div><div className="rounded-xl bg-muted/60 p-4"><p className="text-xs font-bold text-muted-foreground">On call</p><p className="mt-2 font-mono-ui text-2xl font-bold">01</p><p className="mt-1 text-[11px] text-muted-foreground">rapid response team</p></div></div></section></div>;
}

export default App;