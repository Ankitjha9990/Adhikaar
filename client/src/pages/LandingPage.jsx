import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LandingPage.css';

/* ─── Inline SVG Icons ───────────────────────────────────── */
function IconDocument() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* New data-integrity icons */
function IconScales() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M3 9l3-3 3 3" />
      <path d="M3 15h6" />
      <path d="M15 9l3-3 3 3" />
      <path d="M15 15h6" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function IconGavel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3l7 7-1.5 1.5-7-7L14 3z" />
      <path d="M9.5 9.5l-7 7" />
      <path d="M3 21l2-2" />
      <path d="M15 9l3 3" />
      <rect x="2" y="18" width="6" height="3" rx="1" />
    </svg>
  );
}

function IconNewspaper() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6z" />
    </svg>
  );
}

/* Flow step icons */
function IconUserProblem() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconLightbulb() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function IconPen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
function LandingPage() {
  const [heroQuery, setHeroQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();

  function handleHeroAnalyze(e) {
    e.preventDefault();
    if (!heroQuery.trim()) return;
    if (!isAuthenticated) {
      openLoginModal('/rights');
      return;
    }
    navigate('/rights', { state: { query: heroQuery.trim() } });
  }

  function handleProtectedCTA(path) {
    if (!isAuthenticated) {
      openLoginModal(path);
    } else {
      navigate(path);
    }
  }

  return (
    <div className="landing">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="hero section">
        <div className="container hero__grid">
          <div className="hero__content anim-fade-up">
            <p className="hero__eyebrow text-gold tracking-wider uppercase text-xs fw-semibold">
              Know · Act · Empower
            </p>
            <span className="gold-rule-short" style={{ marginBottom: 'var(--space-5)' }} />

            <h1 className="hero__headline font-display">
              Your Rights.<br />
              <em className="hero__headline-em">Made Clear.</em>
            </h1>

            <p className="hero__subline">
              From RTI requests to everyday legal problems, Adhikaar turns confusing
              information into clear answers and actionable next steps.
            </p>

            <form className="hero__search" onSubmit={handleHeroAnalyze} role="search">
              <div className="hero__search-inner">
                <IconSearch />
                <input
                  id="hero-search-input"
                  type="text"
                  className="hero__search-input"
                  placeholder="Search your issue (e.g., PF settlement, rental dispute)..."
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  aria-label="Describe your legal issue"
                />
              </div>
              <button type="submit" className="btn btn-primary hero__search-btn">
                Analyze
              </button>
            </form>

            <div className="hero__ctas">
              <button
                id="hero-explore-rights-btn"
                className="btn btn-primary btn-lg"
                onClick={() => handleProtectedCTA('/rights')}
              >
                Explore Your Rights
              </button>
              <button
                id="hero-draft-rti-btn"
                className="btn btn-outline btn-lg"
                onClick={() => handleProtectedCTA('/rti')}
              >
                Draft an RTI
              </button>
            </div>
          </div>

          {/* Live Analysis Preview Card */}
          <div className="hero__preview-col anim-fade-up delay-3">
            <div className="hero__preview card">
              <div className="hero__preview-header">
                <span className="hero__preview-dot hero__preview-dot--gold" />
                <span className="text-xs fw-semibold tracking-wider uppercase text-muted">Live Analysis</span>
              </div>
              <div className="hero__preview-lines">
                <div className="skeleton hero__preview-line hero__preview-line--full" />
                <div className="skeleton hero__preview-line hero__preview-line--wide" />
                <div className="skeleton hero__preview-line hero__preview-line--med" />
              </div>
              <div className="hero__preview-processing">
                <div className="hero__preview-spinner" />
                <span className="text-xs text-muted font-mono">Processing legal context...</span>
              </div>
            </div>

            {/* Sample analysis card below */}
            <div className="hero__sample card anim-fade-up delay-4">
              <div className="hero__sample-header">
                <span className="badge badge-ink">
                  <IconShield />
                  Tenant Dispute Analysis
                </span>
              </div>
              <p className="hero__sample-quote">
                "My landlord is withholding my security deposit without providing a valid reason or itemized deductions."
              </p>
              <div className="hero__sample-result">
                <p className="hero__sample-text">
                  Under the Model Tenancy Act, landlords must return the security deposit within a
                  specified timeframe and provide an itemized list of any deductions.
                </p>
                <span className="citation-badge">
                  <IconDocument />
                  REF: MODEL TENANCY ACT, SECTION 11
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div className="container">
        <span className="gold-rule" />
      </div>

      {/* ── Two Paths Section ── */}
      <section className="paths section">
        <div className="container">
          <div className="paths__intro anim-fade-up">
            <h2 className="paths__heading font-display">
              One problem.<br />Two ways forward.
            </h2>
          </div>

          <div className="paths__grid">
            {/* Path 01 — RTI */}
            <div className="path-card card card-hover anim-fade-up delay-1">
              <div className="path-card__top">
                <div className="path-card__icon-wrap">
                  <IconDocument />
                </div>
                <span className="badge badge-ink path-card__badge">Path 01</span>
              </div>

              <h3 className="path-card__title font-display">
                Turn Questions Into Action.
              </h3>
              <p className="path-card__desc">
                Describe what you want to know; we'll format the RTI application.
                Focus on your query, we handle the bureaucratic structure.
              </p>

              <div className="path-card__how">
                <p className="path-card__how-label text-xs text-muted tracking-wider uppercase">How it works</p>
                <ul className="path-card__steps">
                  <li className="path-card__step">
                    <span className="path-card__check"><IconCheck /></span>
                    Draft your query in plain English
                  </li>
                  <li className="path-card__step">
                    <span className="path-card__check"><IconCheck /></span>
                    Automatic formatting to statutory requirements
                  </li>
                  <li className="path-card__step">
                    <span className="path-card__check"><IconCheck /></span>
                    Download ready-to-file PDF
                  </li>
                </ul>
              </div>

              <button
                id="landing-rti-cta-btn"
                className="path-card__cta"
                onClick={() => handleProtectedCTA('/rti')}
              >
                Draft RTI <IconArrow />
              </button>
            </div>

            {/* Path 02 — Rights Navigator */}
            <div className="path-card card card-hover anim-fade-up delay-2">
              <div className="path-card__top">
                <div className="path-card__icon-wrap">
                  <IconCompass />
                </div>
                <span className="badge badge-ink path-card__badge">Path 02</span>
              </div>

              <h3 className="path-card__title font-display">
                Know What You Can Do Next.
              </h3>
              <p className="path-card__desc">
                Understand your rights in tenant, consumer, or workplace disputes.
                Navigate complex legal situations with step-by-step guidance.
              </p>

              <div className="path-card__how">
                <p className="path-card__how-label text-xs text-muted tracking-wider uppercase">How it works</p>
                <ul className="path-card__steps">
                  <li className="path-card__step">
                    <span className="path-card__check"><IconCheck /></span>
                    Identify the core legal issue
                  </li>
                  <li className="path-card__step">
                    <span className="path-card__check"><IconCheck /></span>
                    Match with relevant statutes and acts
                  </li>
                  <li className="path-card__step">
                    <span className="path-card__check"><IconCheck /></span>
                    Get actionable next steps tailored to you
                  </li>
                </ul>
              </div>

              <button
                id="landing-rights-cta-btn"
                className="path-card__cta"
                onClick={() => handleProtectedCTA('/rights')}
              >
                Navigate Rights <IconArrow />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div className="container">
        <span className="gold-rule" />
      </div>

      {/* ── Built on Sources Section ── */}
      <section className="sources section">
        <div className="container sources__grid">
          <div className="sources__left anim-fade-up">
            <p className="text-xs fw-semibold tracking-wider uppercase text-gold">Not Invented</p>
            <h2 className="sources__heading font-display">
              Built on Sources.
            </h2>
            <p className="sources__desc">
              Our analysis is grounded in verifiable legal texts, ensuring accuracy and
              reliability for every step you take.
            </p>

            <div className="sources__integrity card">
              <p className="text-xs fw-semibold tracking-wider uppercase text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                Data Integrity
              </p>
              <ul className="sources__list">
                <li className="sources__item">
                  <span className="sources__item-icon">
                    <IconScales />
                  </span>
                  <div>
                    <p className="fw-medium text-sm">Statutes</p>
                    <p className="text-xs text-muted">Central &amp; State Acts</p>
                  </div>
                </li>
                <li className="sources__item">
                  <span className="sources__item-icon">
                    <IconGavel />
                  </span>
                  <div>
                    <p className="fw-medium text-sm">Case Law</p>
                    <p className="text-xs text-muted">Supreme Court Precedents</p>
                  </div>
                </li>
                <li className="sources__item">
                  <span className="sources__item-icon">
                    <IconNewspaper />
                  </span>
                  <div>
                    <p className="fw-medium text-sm">Gazettes</p>
                    <p className="text-xs text-muted">Official Notifications</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="sources__flow anim-fade-up delay-2">
            <div className="flow-step">
              <div className="flow-step__icon"><IconUserProblem /></div>
              <p className="flow-step__label text-xs text-muted tracking-wider uppercase">User Problem</p>
              <p className="flow-step__text text-sm">"I haven't received my PF settlement."</p>
            </div>
            <div className="flow-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="flow-step flow-step--featured">
              <div className="flow-step__icon"><IconBook /></div>
              <p className="flow-step__label text-xs text-muted tracking-wider uppercase">Relevant Source</p>
              <p className="flow-step__text text-sm">Employees' Provident Funds Act</p>
            </div>
            <div className="flow-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="flow-step">
              <div className="flow-step__icon"><IconLightbulb /></div>
              <p className="flow-step__label text-xs text-muted tracking-wider uppercase">Simple Explanation</p>
              <p className="flow-step__text text-sm">Clear steps on statutory timelines.</p>
            </div>
            <div className="flow-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="flow-step flow-step--gold">
              <div className="flow-step__icon"><IconPen /></div>
              <p className="flow-step__label text-xs text-muted tracking-wider uppercase">Action</p>
              <p className="flow-step__text text-sm">Draft targeted RTI to EPFO</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-section__inner">
            <h2 className="cta-section__heading font-display">
              Rights only matter when people can use them.
            </h2>
            <p className="cta-section__sub">
              Don't know where to start? Start with what happened.
            </p>
            <form className="cta-section__form" onSubmit={handleHeroAnalyze}>
              <input
                id="cta-search-input"
                type="text"
                className="form-input cta-section__input"
                placeholder="E.g., I bought a defective phone and the store refuses to replace it..."
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                aria-label="Describe your situation to get started"
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Analyze Situation
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
