import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSrc from '../assets/Adhikaar_Logo.png';
import './LoginModal.css';

function LoginModal() {
  const { showLoginModal, closeLoginModal, login, register, loginRedirectPath } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showLoginModal) {
      setForm({ name: '', email: '', password: '', confirm: '' });
      setError('');
      setTab('login');
    }
  }, [showLoginModal]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeLoginModal();
    }
    if (showLoginModal) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showLoginModal, closeLoginModal]);

  useEffect(() => {
    document.body.style.overflow = showLoginModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showLoginModal]);

  if (!showLoginModal) return null;

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
      if (loginRedirectPath) {
        navigate(loginRedirectPath);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) closeLoginModal();
  }

  return (
    <div
      className="login-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to Adhikaar"
    >
      <div className="login-modal">
        <button
          id="login-modal-close"
          className="login-modal__close"
          onClick={closeLoginModal}
          aria-label="Close login dialog"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="login-modal__header">
          <img src={logoSrc} alt="Adhikaar logo" className="login-modal__logo" />
          <h2 className="login-modal__title font-display">
            {tab === 'login' ? 'Welcome back.' : 'Create your account.'}
          </h2>
          <p className="login-modal__subtitle">
            {tab === 'login'
              ? 'Sign in to access RTI Drafting and Rights Navigator.'
              : 'Join Adhikaar to start exercising your rights.'}
          </p>
        </div>

        <div className="login-modal__tabs" role="tablist" aria-label="Authentication mode">
          <button
            role="tab"
            id="tab-login"
            aria-selected={tab === 'login'}
            className={`login-modal__tab ${tab === 'login' ? 'login-modal__tab--active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            role="tab"
            id="tab-signup"
            aria-selected={tab === 'signup'}
            className={`login-modal__tab ${tab === 'signup' ? 'login-modal__tab--active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form className="login-modal__form" onSubmit={handleSubmit} noValidate>
          {tab === 'signup' && (
            <div className="login-modal__field">
              <label htmlFor="modal-name" className="form-label">Full Name</label>
              <input
                id="modal-name"
                type="text"
                className="form-input"
                placeholder="Ramesh Kumar"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-modal__field">
            <label htmlFor="modal-email" className="form-label">Email Address</label>
            <input
              id="modal-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-modal__field">
            <label htmlFor="modal-password" className="form-label">Password</label>
            <input
              id="modal-password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {tab === 'signup' && (
            <div className="login-modal__field">
              <label htmlFor="modal-confirm" className="form-label">Confirm Password</label>
              <input
                id="modal-confirm"
                type="password"
                className="form-input"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={(e) => handleChange('confirm', e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="login-modal__error" role="alert">
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
            id="login-modal-submit"
            className="btn btn-primary login-modal__submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-modal__switch">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="login-modal__switch-btn"
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="login-modal__legal">
          Your data is securely stored in our database.
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
