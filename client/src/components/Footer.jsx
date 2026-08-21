import React from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../assets/Adhikaar_Logo.png';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__brand-link">
            <img src={logoSrc} alt="Adhikaar logo" className="footer__logo" />
            <span className="footer__wordmark">Adhikaar</span>
          </Link>
          <p className="footer__tagline">
            Empowering citizens through legal transparency.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Footer navigation">
          <div className="footer__nav-group">
            <h3 className="footer__nav-heading">Product</h3>
            <Link to="/" className="footer__nav-link">Home</Link>
            <Link to="/rti" className="footer__nav-link">RTI Drafting</Link>
            <Link to="/rights" className="footer__nav-link">Rights Navigator</Link>
            <Link to="/how-it-works" className="footer__nav-link">How It Works</Link>
          </div>

          <div className="footer__nav-group">
            <h3 className="footer__nav-heading">Legal</h3>
            <a href="#" className="footer__nav-link">Privacy Policy</a>
            <a href="#" className="footer__nav-link">Terms of Service</a>
            <a href="#" className="footer__nav-link">Legal Disclaimer</a>
            <a href="#" className="footer__nav-link">Contact Us</a>
          </div>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {year} Adhikaar AI. Empowering Indian citizens through transparent legal technology.
          </p>
          <p className="footer__copy footer__copy--right">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
