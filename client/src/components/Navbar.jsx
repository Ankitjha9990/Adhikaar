import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSrc from '../assets/Adhikaar_Logo.png';
import './Navbar.css';

/* Protected routes that require authentication */
const PROTECTED = ['/rti', '/rights'];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, openLoginModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  function isActive(path) {
    return location.pathname === path;
  }

  function handleProtectedNav(e, path) {
    if (!isAuthenticated) {
      e.preventDefault();
      openLoginModal(path);
    }
  }

  function handleGetStarted() {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      openLoginModal('/dashboard');
    }
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <img src={logoSrc} alt="Adhikaar logo" className="navbar__logo" />
          <span className="navbar__wordmark">Adhikaar</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}
          >
            Home
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/rti"
            className={`navbar__link ${isActive('/rti') ? 'navbar__link--active' : ''}`}
            onClick={(e) => handleProtectedNav(e, '/rti')}
          >
            RTI Drafting
          </Link>
          <Link
            to="/rights"
            className={`navbar__link ${isActive('/rights') ? 'navbar__link--active' : ''}`}
            onClick={(e) => handleProtectedNav(e, '/rights')}
          >
            Rights Navigator
          </Link>
          <Link
            to="/how-it-works"
            className={`navbar__link ${isActive('/how-it-works') ? 'navbar__link--active' : ''}`}
          >
            How It Works
          </Link>
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__user">
              <div className="navbar__avatar" aria-label={`Signed in as ${user.name}`}>
                {user.initials || (user.name ? user.name.slice(0, 2).toUpperCase() : 'U')}
              </div>
              <div className="navbar__user-dropdown">
                <p className="navbar__user-name">{user.name}</p>
                <p className="navbar__user-email">{user.email}</p>
                <hr className="navbar__user-divider" />
                <Link to="/dashboard" className="navbar__user-dropdown-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  id="navbar-logout-btn"
                  className="navbar__user-logout"
                  onClick={logout}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/auth?redirect=/dashboard" className="btn btn-ghost btn-sm navbar__login-btn">
                Sign In
              </Link>
              <button
                id="navbar-get-started-btn"
                className="btn btn-primary btn-sm"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </>
          )}

          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar__mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}

export default Navbar;
