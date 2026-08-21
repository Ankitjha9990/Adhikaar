import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSrc from '../assets/Adhikaar_Logo.png';
import './AuthPage.css';

function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(redirectPath, { replace: true });
  }, [isAuthenticated, navigate, redirectPath]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (tab === 'signup') {
      if (!form.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (tab === 'signup') {
        await register(form.name.trim(), form.email.trim(), form.password);
      } else {
        await login(form.email.trim(), form.password);
      }
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <aside className="auth-page__panel">
        <div className="auth-page__panel-inner">
          <Link to="/" className="auth-page__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </Link>

          <div className="auth-page__panel-content">
            <span className="gold-rule-short" />
            <h2 className="auth-page__panel-heading font-display">
              Know your rights.<br />
              Act with clarity.
            </h2>
            <p className="auth-page__panel-desc">
              Join thousands of citizens using Adhikaar to navigate India's legal
              system — with confidence and without a law degree.
            </p>

            <ul className="auth-page__panel-features">
              {[
                'Draft RTI applications in minutes',
                'Understand tenant & consumer rights',
                'Grounded in real Indian statutes',
                'No legal jargon — plain language always',
              ].map((feat) => (
                <li key={feat} className="auth-page__panel-feature">
                  <span className="auth-page__feature-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <p className="auth-page__panel-footer">
            Adhikaar AI · OOSC 4.0 Hackathon Prototype
          </p>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="auth-page__form-panel">
        <div className="auth-page__form-inner">
          <div className="auth-page__brand">
            <img src={logoSrc} alt="Adhikaar logo" className="auth-page__logo" />
            <span className="auth-page__wordmark font-display">Adhikaar</span>
          </div>

          <div className="auth-page__heading-group">
            <h1 className="auth-page__title font-display">
              {tab === 'login' ? 'Sign in to continue.' : 'Create your account.'}
            </h1>
            <p className="auth-page__subtitle">
              {tab === 'login'
                ? 'Welcome back. Enter your details to access the platform.'
                : 'Start exercising your rights today — it takes 30 seconds.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="auth-page__tabs" role="tablist" aria-label="Authentication mode">
            <button
              role="tab"
              id="auth-tab-login"
              aria-selected={tab === 'login'}
              className={`auth-page__tab ${tab === 'login' ? 'auth-page__tab--active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              role="tab"
              id="auth-tab-signup"
              aria-selected={tab === 'signup'}
              className={`auth-page__tab ${tab === 'signup' ? 'auth-page__tab--active' : ''}`}
              onClick={() => { setTab('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
            {tab === 'signup' && (
              <div className="auth-page__field">
                <label htmlFor="auth-name" className="form-label">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  className="form-input auth-page__input"
                  placeholder="Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="auth-page__field">
              <label htmlFor="auth-email" className="form-label">Email Address</label>
              <input
                id="auth-email"
                type="email"
                className="form-input auth-page__input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-page__field">
              <label htmlFor="auth-password" className="form-label">Password</label>
              <input
                id="auth-password"
                type="password"
                className="form-input auth-page__input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {tab === 'signup' && (
              <div className="auth-page__field">
                <label htmlFor="auth-confirm" className="form-label">Confirm Password</label>
                <input
                  id="auth-confirm"
                  type="password"
                  className="form-input auth-page__input"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => handleChange('confirm', e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="auth-page__error" role="alert">
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
              id="auth-submit-btn"
              className="btn btn-primary btn-lg auth-page__submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting
                ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-page__switch">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="auth-page__switch-btn"
              onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
            >
              {tab === 'login' ? 'Sign up for free' : 'Sign in instead'}
            </button>
          </p>

          <p className="auth-page__legal">
            Your data is securely stored in our database and never shared with third parties.
          </p>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
