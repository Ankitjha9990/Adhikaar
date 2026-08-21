import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CitationBadge from '../components/CitationBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import './RTIDraftingPage.css';

/* ─── Indian States list ─────────────────────────────────── */
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi (NCT)', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

/* ─── Breadcrumb ─────────────────────────────────────────── */
function Breadcrumb() {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/" className="breadcrumb__link">Home</Link>
      <span className="breadcrumb__sep" aria-hidden="true">›</span>
      <span className="breadcrumb__current" aria-current="page">RTI Drafting</span>
    </nav>
  );
}

/* ─── Document Icon ──────────────────────────────────────── */
function IconDraft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconGavel() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.15 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
function RTIDraftingPage() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [applicant, setApplicant] = useState({ name: '', contact: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Load preloaded draft or query state from location
  useEffect(() => {
    if (location.state) {
      if (location.state.query) setQuery(location.state.query);
      if (location.state.applicant) setApplicant(location.state.applicant);
      if (location.state.preloadedResult) setResult(location.state.preloadedResult);
    }
  }, [location.state]);

  function handleApplicantChange(field, value) {
    setApplicant((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    if (!query.trim()) return 'Please describe the information you want from the government.';
    if (!applicant.name.trim()) return 'Full name is required for the RTI application.';
    if (!applicant.address.trim()) return 'Postal address is required for the RTI application.';
    if (!applicant.contact.trim()) return 'Contact number is required for the RTI application.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/rti/generate', {
        query: query.trim(),
        applicant: {
          name: applicant.name.trim(),
          address: applicant.address.trim(),
          contact: applicant.contact.trim(),
        },
        region: region || undefined,
      });
      setResult(response.data);

      // Save to localStorage activity log
      const existing = localStorage.getItem('adhikaar_rti_drafts')
        ? JSON.parse(localStorage.getItem('adhikaar_rti_drafts'))
        : [];
      
      const newDraft = {
        id: Date.now().toString(),
        query: query.trim(),
        department: response.data.department || 'General Department',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Draft Ready',
        applicationText: response.data.application_text,
        pdfBase64: response.data.pdf_base64,
        citations: response.data.citations || [],
        applicant: {
          name: applicant.name.trim(),
          address: applicant.address.trim(),
          contact: applicant.contact.trim(),
        }
      };

      localStorage.setItem('adhikaar_rti_drafts', JSON.stringify([newDraft, ...existing]));
    } catch (err) {
      // Show a user-friendly message rather than raw error
      const serverMsg = err.response?.data?.error;
      setError(serverMsg || 'RTI generation failed. Please try again or rephrase your query.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyText() {
    if (!result?.application_text) return;
    navigator.clipboard.writeText(result.application_text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadPDF() {
    if (!result?.pdf_base64) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${result.pdf_base64}`;
    link.download = `RTI_Application_${Date.now()}.pdf`;
    link.click();
  }

  const isFormFilled = query.trim() && applicant.name.trim() && applicant.address.trim() && applicant.contact.trim();

  // Auth gate: if not logged in, show lock screen
  if (!isAuthenticated) {
    return (
      <div className="rti-page">
        <Navbar />
        <main className="rti-page__main rti-page__auth-gate">
          <div className="container">
            <div className="auth-gate-prompt">
              <div className="auth-gate-prompt__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="auth-gate-prompt__title font-display">Sign in to draft an RTI.</h1>
              <p className="auth-gate-prompt__desc">
                RTI Drafting requires an account. Your applicant details are used only to generate your document.
              </p>
              <div className="auth-gate-prompt__actions">
                <button
                  id="rti-gate-login-btn"
                  className="btn btn-primary btn-lg"
                  onClick={() => openLoginModal('/rti')}
                >
                  Sign In
                </button>
                <Link to="/auth?tab=signup&redirect=/rti" className="btn btn-outline btn-lg">
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
    <div className="rti-page">
      <Navbar />

      <main className="rti-page__main">
        <div className="container rti-page__container">
          <div className="rti-page__header anim-fade-up">
            <Breadcrumb />
            <h1 className="rti-page__title font-display">Draft an RTI application</h1>
          </div>

          <div className="rti-page__layout">
            {/* ── Left Panel: Form ── */}
            <aside className="rti-form anim-fade-up delay-1">
              <form onSubmit={handleSubmit} noValidate>
                {/* Query textarea */}
                <section className="rti-form__section">
                  <h2 className="rti-form__section-title">
                    What information do you want from the government?
                  </h2>
                  <p className="rti-form__section-desc">
                    Provide as much detail as possible. Our agent will identify the correct
                    authority and format.
                  </p>
                  <div className="rti-form__textarea-wrap">
                    <textarea
                      id="rti-query"
                      className="form-input form-textarea rti-form__textarea"
                      placeholder="I want to know why the road near my locality has not been repaired..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Describe the information you want from the government"
                      rows={7}
                    />
                    <span className="rti-form__textarea-hint font-mono text-xs text-muted">
                      Section 6(1)
                    </span>
                  </div>
                </section>

                {/* Applicant details */}
                <section className="rti-form__section">
                  <div className="card rti-form__details-card">
                    <h2 className="rti-form__section-title">Applicant Details</h2>

                    <div className="rti-form__field">
                      <label htmlFor="rti-state" className="form-label">State/Region for Application</label>
                      <select
                        id="rti-state"
                        className="form-input form-select"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option value="">Select State</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="rti-form__row">
                      <div className="rti-form__field">
                        <label htmlFor="rti-name" className="form-label">Full Name <span aria-hidden="true">*</span></label>
                        <input
                          id="rti-name"
                          type="text"
                          className="form-input"
                          value={applicant.name}
                          onChange={(e) => handleApplicantChange('name', e.target.value)}
                          placeholder="Ramesh Kumar"
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="rti-form__field">
                        <label htmlFor="rti-contact" className="form-label">Contact Number <span aria-hidden="true">*</span></label>
                        <input
                          id="rti-contact"
                          type="tel"
                          className="form-input"
                          value={applicant.contact}
                          onChange={(e) => handleApplicantChange('contact', e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div className="rti-form__field">
                      <label htmlFor="rti-address" className="form-label">Full Postal Address <span aria-hidden="true">*</span></label>
                      <input
                        id="rti-address"
                        type="text"
                        className="form-input"
                        value={applicant.address}
                        onChange={(e) => handleApplicantChange('address', e.target.value)}
                        placeholder="123, Street Name, City, State - PIN"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                </section>

                {/* Error message */}
                {error && (
                  <div className="rti-form__error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                  </div>
                )}

                <DisclaimerBanner featureName="RTI Drafting" />

                <button
                  type="submit"
                  id="rti-draft-btn"
                  className="btn btn-primary btn-lg rti-form__submit"
                  disabled={loading || !isFormFilled}
                  aria-busy={loading}
                >
                  <IconDraft />
                  {loading ? 'Drafting Application...' : 'Draft Application'}
                </button>
              </form>
            </aside>

            {/* ── Right Panel: Workspace ── */}
            <div className="rti-workspace anim-fade-up delay-2">
              {/* Empty state */}
              {!loading && !result && (
                <div className="rti-workspace__empty">
                  <IconGavel />
                  <h2 className="rti-workspace__empty-title font-display">Drafting Workspace</h2>
                  <p className="rti-workspace__empty-desc">
                    Fill out the details on the left to generate a formal, legally grounded
                    RTI application.
                  </p>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <LoadingSpinner
                  fullPage
                  steps={[
                    'Retrieving relevant RTI Act provisions',
                    'Analysing your query against legal sources',
                    'Generating your RTI application',
                    'Formatting and generating PDF',
                  ]}
                />
              )}

              {/* Result */}
              {!loading && result && (
                <div className="rti-result anim-fade-up">
                  {/* Department banner */}
                  {result.department && (
                    <div className="rti-result__dept">
                      <span className="badge badge-blue">Addressed To</span>
                      <p className="rti-result__dept-name">{result.department}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="rti-result__actions">
                    <button
                      id="rti-copy-btn"
                      className="btn btn-ghost btn-sm"
                      onClick={handleCopyText}
                      aria-live="polite"
                    >
                      <IconCopy />
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                    {result.pdf_base64 && (
                      <button
                        id="rti-download-btn"
                        className="btn btn-primary btn-sm"
                        onClick={handleDownloadPDF}
                      >
                        <IconDownload />
                        Download PDF
                      </button>
                    )}
                  </div>

                  {/* Application text */}
                  <div className="rti-result__doc">
                    <pre className="rti-result__pre">{result.application_text}</pre>
                  </div>

                  {/* Citations */}
                  {Array.isArray(result.citations) && result.citations.length > 0 && (
                    <div className="rti-result__citations">
                      <p className="text-xs fw-semibold tracking-wider uppercase text-muted" style={{ marginBottom: 'var(--space-2)' }}>
                        Legal Basis
                      </p>
                      <div className="rti-result__citations-list">
                        {result.citations.map((c, i) => (
                          <CitationBadge key={i} citation={c} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission warning */}
                  <p className="rti-result__warning text-xs text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline', marginRight:'4px' }} aria-hidden="true">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Please verify the department address before submission. This is a drafting
                    aid, not a legal filing service.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RTIDraftingPage;
