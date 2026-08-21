import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HowItWorksPage.css';

/* ─── Icons ──────────────────────────────────────────────── */
function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function IconCPU() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Pipeline Steps ─────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    number: '01',
    icon: <IconSearch />,
    title: 'You describe your situation',
    desc: 'Type your problem in plain language — no legal jargon required. You can optionally select a category (Tenant, Consumer, Workplace) or let Adhikaar identify it automatically.',
    example: '"My landlord is refusing to return my security deposit."',
  },
  {
    number: '02',
    icon: <IconDatabase />,
    title: 'We search verified legal sources',
    desc: 'Your query is matched against a hand-curated knowledge base of real Indian legal acts — RTI Act 2005, Model Tenancy Act 2021, Consumer Protection Act 2019, and workplace regulations.',
    example: 'Model Tenancy Act, 2021 — Section 11 (Security Deposit)',
  },
  {
    number: '03',
    icon: <IconCPU />,
    title: 'AI generates a grounded answer',
    desc: 'A large language model reads the retrieved legal excerpts and drafts a clear, plain-language explanation. It is explicitly instructed to cite only what was retrieved — never invent.',
    example: 'Structured output: explanation + numbered steps + citations',
  },
  {
    number: '04',
    icon: <IconCheckCircle />,
    title: 'You receive actionable next steps',
    desc: 'Every response includes: what the law says, numbered steps you can take right now, and the specific act/section backing each point — so you can act with confidence.',
    example: 'Send a written demand → File with Rent Authority → Legal notice',
  },
];

/* ─── Principles ─────────────────────────────────────────── */
const PRINCIPLES = [
  {
    icon: <IconShield />,
    title: 'Grounded, not guessed',
    desc: 'Every answer is retrieved from real, pre-indexed legal texts. The AI cannot cite a section that was not in the retrieved context.',
  },
  {
    icon: <IconUsers />,
    title: 'Written for people, not lawyers',
    desc: 'We translate dense statutory language into plain English. You should understand what your rights are without needing a law degree.',
  },
  {
    icon: <IconLock />,
    title: 'Your data, your session',
    desc: 'Personal details you enter (like your name and address for RTI) are used only to generate your document — never stored beyond your session.',
  },
];

/* ─── Known Scope ─────────────────────────────────────────── */
const SCOPE_ITEMS = [
  { label: 'RTI Act, 2005', note: 'Sections 6, 7, 8 — request procedure, timelines, exemptions', covered: true },
  { label: 'Model Tenancy Act, 2021', note: 'Security deposit, rent increases, notice periods, eviction', covered: true },
  { label: 'Consumer Protection Act, 2019', note: 'Right to complain, consumer forums, refund timelines', covered: true },
  { label: 'Payment of Wages Act', note: 'Wage-payment disputes, deduction rules', covered: true },
  { label: 'State-specific tenancy laws', note: 'Covered by Model Act only; state variants not yet indexed', covered: false },
  { label: 'Criminal law / FIR guidance', note: 'Out of scope for this prototype', covered: false },
  { label: 'Family & personal law', note: 'Out of scope for this prototype', covered: false },
];

/* ─── Main Component ─────────────────────────────────────── */
function HowItWorksPage() {
  return (
    <div className="hiw-page">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="hiw-hero section">
          <div className="container hiw-hero__content anim-fade-up">
            <p className="text-xs fw-semibold tracking-wider uppercase text-gold">
              Behind the answers
            </p>
            <span className="gold-rule-short" style={{ marginBottom: 'var(--space-4)' }} />
            <h1 className="hiw-hero__title font-display">
              How Adhikaar works.
            </h1>
            <p className="hiw-hero__subtitle">
              No black boxes. Here's exactly how your plain-language description becomes
              a legally grounded, actionable answer — step by step.
            </p>
          </div>
        </section>

        {/* ── Pipeline ── */}
        <section className="hiw-pipeline section-sm">
          <div className="container">
            <ol className="hiw-pipeline__steps">
              {PIPELINE_STEPS.map((step, i) => (
                <li key={i} className={`hiw-step anim-fade-up delay-${i + 1}`}>
                  <div className="hiw-step__left">
                    <div className="hiw-step__icon-wrap">
                      {step.icon}
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div className="hiw-step__connector" aria-hidden="true" />
                    )}
                  </div>
                  <div className="hiw-step__body">
                    <div className="hiw-step__top">
                      <span className="hiw-step__number font-mono">{step.number}</span>
                      <h2 className="hiw-step__title font-display">{step.title}</h2>
                    </div>
                    <p className="hiw-step__desc">{step.desc}</p>
                    <div className="hiw-step__example">
                      <span className="text-xs text-muted fw-medium uppercase tracking-wider" style={{ marginRight: 'var(--space-2)' }}>Example</span>
                      <span className="citation-badge">{step.example}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Gold rule ── */}
        <div className="container">
          <span className="gold-rule" />
        </div>

        {/* ── Design Principles ── */}
        <section className="hiw-principles section">
          <div className="container">
            <div className="hiw-principles__intro anim-fade-up">
              <p className="text-xs fw-semibold tracking-wider uppercase text-gold">Our approach</p>
              <h2 className="hiw-principles__title font-display">
                Built on three commitments.
              </h2>
            </div>

            <div className="hiw-principles__grid">
              {PRINCIPLES.map((p, i) => (
                <div key={i} className={`hiw-principle-card card card-hover anim-fade-up delay-${i + 1}`}>
                  <div className="hiw-principle-card__icon">
                    {p.icon}
                  </div>
                  <h3 className="hiw-principle-card__title font-display">{p.title}</h3>
                  <p className="hiw-principle-card__desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gold rule ── */}
        <div className="container">
          <span className="gold-rule" />
        </div>

        {/* ── Scope & Limitations ── */}
        <section className="hiw-scope section">
          <div className="container hiw-scope__grid">
            <div className="hiw-scope__intro anim-fade-up">
              <p className="text-xs fw-semibold tracking-wider uppercase text-gold">Transparency</p>
              <h2 className="hiw-scope__title font-display">
                What's covered — and what isn't.
              </h2>
              <p className="hiw-scope__desc">
                Depth on a well-scoped set of laws beats shallow coverage of everything.
                Here's exactly what's indexed in this prototype, and what's not.
              </p>
            </div>

            <div className="hiw-scope__table anim-fade-up delay-2">
              <div className="hiw-scope__table-header">
                <span>Legal Source</span>
                <span>Status</span>
              </div>
              {SCOPE_ITEMS.map((item, i) => (
                <div key={i} className={`hiw-scope__row ${item.covered ? 'hiw-scope__row--covered' : 'hiw-scope__row--out'}`}>
                  <div className="hiw-scope__row-left">
                    <span className={`hiw-scope__indicator ${item.covered ? 'hiw-scope__indicator--yes' : 'hiw-scope__indicator--no'}`} aria-hidden="true" />
                    <div>
                      <p className="hiw-scope__row-label">{item.label}</p>
                      <p className="hiw-scope__row-note">{item.note}</p>
                    </div>
                  </div>
                  <span className={`badge ${item.covered ? 'badge-blue' : 'badge-ink'}`}>
                    {item.covered ? 'Covered' : 'Not covered'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="hiw-cta">
          <div className="container hiw-cta__inner">
            <h2 className="hiw-cta__title font-display">
              Ready to exercise your rights?
            </h2>
            <div className="hiw-cta__btns">
              <Link to="/rights" className="btn btn-primary btn-lg">
                Navigate My Rights
              </Link>
              <Link to="/rti" className="btn btn-outline btn-lg">
                Draft an RTI
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HowItWorksPage;
