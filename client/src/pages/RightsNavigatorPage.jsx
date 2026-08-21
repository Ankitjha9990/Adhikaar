import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CitationBadge from '../components/CitationBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import './RightsNavigatorPage.css';

/* ─── Category config ────────────────────────────────────── */
const CATEGORIES = [
  { id: 'tenant',    label: 'Tenant',    desc: 'Rent, deposits, eviction' },
  { id: 'consumer',  label: 'Consumer',  desc: 'Refunds, defective goods' },
  { id: 'workplace', label: 'Workplace', desc: 'Wages, termination, safety' },
];

/* ─── Sample prompts ─────────────────────────────────────── */
const SAMPLE_PROMPTS = [
  '"My landlord raised the rent by 20% mid-lease."',
  '"I received a defective product and the seller refuses a refund."',
  '"My employer has not paid my salary for two months."',
];

/* ─── Icons ──────────────────────────────────────────────── */
function IconCompass() {
  return (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.12 }}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconLaw() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconSteps() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconAutoIdentify() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
function RightsNavigatorPage() {
  const location = useLocation();
  const { isAuthenticated, openLoginModal } = useAuth();

  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Accept pre-filled query and results from navigation state
  useEffect(() => {
    if (location.state) {
      if (location.state.query) setQuery(location.state.query);
      if (location.state.category) setCategory(location.state.category);
      if (location.state.preloadedResult) setResult(location.state.preloadedResult);
    }
  }, [location.state]);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please describe your situation to get started.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(apiUrl('/api/rights/analyze'), {
        query: query.trim(),
        category: category || null,
      });
      setResult(response.data);

      // Save to localStorage activity log
      const existing = localStorage.getItem('adhikaar_rights_queries')
        ? JSON.parse(localStorage.getItem('adhikaar_rights_queries'))
        : [];
      
      const newQuery = {
        id: Date.now().toString(),
        query: query.trim(),
        category: response.data.category || category || 'General Dispute',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        explanation: response.data.explanation,
        steps: response.data.steps || [],
        citations: response.data.citations || [],
      };

      localStorage.setItem('adhikaar_rights_queries', JSON.stringify([newQuery, ...existing]));
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      setError(serverMsg || 'Analysis failed. Please try rephrasing your situation.');
    } finally {
      setLoading(false);
    }
  }

  function handleSampleClick(sample) {
    // Remove surrounding quotes from sample prompt
    setQuery(sample.replace(/^"|"$/g, ''));
  }

  function handleNewQuery() {
    setResult(null);
    setError('');
  }

  const detectedCategory = result?.category || category;

  // Auth gate: if not logged in, show a lock screen
  if (!isAuthenticated) {
    return (
      <div className="rights-page">
        <Navbar />
        <main className="rights-page__main rights-page__auth-gate">
          <div className="container">
            <div className="auth-gate-prompt">
              <div className="auth-gate-prompt__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="auth-gate-prompt__title font-display">Sign in to continue.</h1>
              <p className="auth-gate-prompt__desc">
                Rights Navigator requires an account. Your session and query history stay private.
              </p>
              <div className="auth-gate-prompt__actions">
                <button
                  id="rights-gate-login-btn"
                  className="btn btn-primary btn-lg"
                  onClick={() => openLoginModal('/rights')}
                >
                  Sign In
                </button>
                <Link to="/auth?tab=signup&redirect=/rights" className="btn btn-outline btn-lg">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="rights-page">
      <Navbar />

      <main className="rights-page__main">
        <div className="container">
          <div className="rights-page__layout">
            {/* ── Left Column: Input ── */}
            <div className="rights-input-col">
              <div className="anim-fade-up">
                <h1 className="rights-page__title font-display">
                  Understand your rights.
                </h1>
                <p className="rights-page__subtitle">
                  Describe your situation in plain language, and we'll help identify
                  relevant laws and next steps.
                </p>
              </div>

              <form className="rights-form anim-fade-up delay-1" onSubmit={handleAnalyze} noValidate>
                {/* Category selector */}
                <div className="rights-form__categories" role="group" aria-label="Select dispute category">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      id={`category-${cat.id}`}
                      className={`rights-form__category-btn ${category === cat.id ? 'rights-form__category-btn--active' : ''}`}
                      onClick={() => setCategory((prev) => (prev === cat.id ? '' : cat.id))}
                      aria-pressed={category === cat.id}
                    >
                      {cat.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    id="category-auto"
                    className={`rights-form__category-btn rights-form__category-btn--auto ${category === '' ? 'rights-form__category-btn--active' : ''}`}
                    onClick={() => setCategory('')}
                    aria-pressed={category === ''}
                  >
                    <IconAutoIdentify />
                    Let Adhikaar Identify
                  </button>
                </div>

                {/* Query textarea */}
                <div className="rights-form__textarea-wrap">
                  <textarea
                    id="rights-query"
                    className="form-input form-textarea rights-form__textarea"
                    placeholder="Start typing... e.g., My landlord is withholding my security deposit without providing any reason."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={6}
                    aria-label="Describe your situation"
                  />
                  <span className="rights-form__textarea-hint font-mono text-xs text-muted">
                    Legal Reference
                  </span>
                </div>

                {/* Sample prompts */}
                <div className="rights-form__samples">
                  <span className="text-xs text-muted">Try: </span>
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      className="rights-form__sample-btn"
                      onClick={() => handleSampleClick(sample)}
                    >
                      {sample}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="rights-form__error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  id="rights-analyze-btn"
                  className="btn btn-primary btn-lg rights-form__submit"
                  disabled={loading || !query.trim()}
                  aria-busy={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Situation →'}
                </button>
              </form>
            </div>

            {/* ── Right Column: Info Panel ── */}
            <aside className="rights-info-col anim-fade-up delay-2">
              {/* Primary source card */}
              <div className="rights-source-card card">
                <div className="rights-source-card__header">
                  <IconBook />
                  <span className="text-xs text-muted">Primary Source Citation</span>
                </div>
                <h3 className="rights-source-card__title font-display">Model Tenancy Act, 2021</h3>
                <p className="rights-source-card__desc">
                  A guiding framework for states to regulate renting of premises and balance the
                  interests of owner and tenant.
                </p>
                <a href="https://mohua.gov.in" target="_blank" rel="noopener noreferrer" className="rights-source-card__link">
                  Read Full Text →
                </a>
              </div>

              {/* Disclaimer card */}
              <div className="card">
                <div className="rights-notice-header">
                  <IconInfo />
                  <span className="text-xs fw-semibold">Important Notice</span>
                </div>
                <p className="text-xs text-muted" style={{ lineHeight: 1.6, marginTop: 'var(--space-2)' }}>
                  The information provided by Rights Navigator is for educational purposes and
                  does not constitute formal legal advice. Consult a qualified legal professional
                  for your specific situation.
                </p>
              </div>

              {/* Placeholder / waiting state */}
              {!result && !loading && (
                <div className="rights-waiting card">
                  <IconCompass />
                  <h3 className="rights-waiting__title font-display">Start with what happened</h3>
                  <p className="text-xs text-muted text-center" style={{ lineHeight: 1.6 }}>
                    Type your situation in the box to see relevant laws and steps appear here.
                  </p>
                </div>
              )}

              {loading && (
                <div className="rights-waiting card">
                  <LoadingSpinner
                    steps={[
                      'Classifying your dispute category',
                      'Retrieving relevant legal provisions',
                      'Analysing your rights under applicable law',
                      'Generating actionable next steps',
                    ]}
                  />
                </div>
              )}
            </aside>
          </div>

          {/* ── Results Section ── */}
          {!loading && result && (
            <div className="rights-results anim-fade-up">
              <div className="rights-results__header">
                <div className="rights-results__header-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <h2 className="rights-results__title">
                    Here's what may apply to your situation
                  </h2>
                </div>
                {detectedCategory && (
                  <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                    {detectedCategory}
                  </span>
                )}
              </div>

              {/* What the law says */}
              <div className="rights-results__block card">
                <div className="rights-results__block-header">
                  <IconLaw />
                  <h3 className="rights-results__block-title">What the law says</h3>
                </div>
                <p className="rights-results__explanation">{result.explanation}</p>

                {/* Citations inline in a blockquote style */}
                {Array.isArray(result.citations) && result.citations.length > 0 && (
                  <div className="rights-results__inline-citation">
                    {result.citations.map((c, i) => (
                      <div key={i} className="rights-results__quote-block">
                        <CitationBadge citation={c} index={i} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* What you can do next */}
              {Array.isArray(result.steps) && result.steps.length > 0 && (
                <div className="rights-results__steps-section">
                  <div className="rights-results__steps-header">
                    <IconSteps />
                    <h3 className="rights-results__block-title">What you can do next</h3>
                  </div>

                  <ol className="rights-results__steps">
                    {result.steps.map((step, i) => {
                      // Step may be a string or object with title/description
                      const title = typeof step === 'object' ? step.title : step;
                      const desc  = typeof step === 'object' ? step.description : null;
                      const hasRTILink = typeof step === 'object' && step.suggest_rti;

                      return (
                        <li key={i} className="rights-step">
                          <div className="rights-step__number-col">
                            <span className="rights-step__dot" aria-hidden="true" />
                            {i < result.steps.length - 1 && (
                              <span className="rights-step__line" aria-hidden="true" />
                            )}
                          </div>
                          <div className="rights-step__content">
                            <span className="rights-step__label text-xs text-muted">Step {i + 1}</span>
                            <h4 className="rights-step__title">{title}</h4>
                            {desc && <p className="rights-step__desc">{desc}</p>}
                            {hasRTILink && (
                              <Link to="/rti" className="btn btn-outline btn-sm rights-step__rti-btn">
                                Draft with RTI Tool
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* New query button */}
              <button
                id="rights-new-query-btn"
                className="btn btn-ghost"
                onClick={handleNewQuery}
              >
                ← Analyze a Different Situation
              </button>

              <DisclaimerBanner featureName="Rights Navigator" />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RightsNavigatorPage;
