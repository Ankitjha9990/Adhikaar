import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl, readApiResponse } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DisclaimerBanner from '../components/DisclaimerBanner';
import './DashboardPage.css';

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

function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconGavel() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3l7 7-1.5 1.5-7-7L14 3z" />
      <path d="M9.5 9.5l-7 7" />
      <path d="M3 21l2-2" />
      <rect x="2" y="18" width="6" height="3" rx="1" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
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

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/* ─── Default Mock Activity Items ────────────────────────── */
const DEFAULT_RTI_DRAFTS = [
  {
    id: 'demo-1',
    query: 'Provide details on funds allocated and spent for public park renovations in Sector 15 under Municipal Corporation.',
    department: 'Municipal Corporation (CPIO)',
    date: '20 Aug 2026',
    status: 'Ready to File',
    isDemo: true,
  },
  {
    id: 'demo-2',
    query: 'Information regarding the timeline and reason for delay in Employees Provident Fund settlement for Account No: DL/CPM/0091823/000.',
    department: 'EPFO CPIO',
    date: '18 Aug 2026',
    status: 'Draft',
    isDemo: true,
  }
];

const DEFAULT_RIGHTS_QUERIES = [
  {
    id: 'demo-3',
    query: 'My landlord is demanding a 25% rent increase in Delhi mid-lease and threatening eviction if I do not comply.',
    category: 'Tenant Dispute',
    date: '19 Aug 2026',
    isDemo: true,
  },
  {
    id: 'demo-4',
    query: 'I ordered a smartphone online, received a refurbished product instead of new, and customer support rejected my return request.',
    category: 'Consumer Protection',
    date: '17 Aug 2026',
    isDemo: true,
  }
];

/* ─── Main Dashboard Page ────────────────────────────────── */
function DashboardPage() {
  const { user, token, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('rti');
  const [rtiDrafts, setRtiDrafts] = useState([]);
  const [rightsQueries, setRightsQueries] = useState([]);

  // Profile Edit State
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // Load activity items on mount
  useEffect(() => {
    const localRti = localStorage.getItem('adhikaar_rti_drafts');
    const localRights = localStorage.getItem('adhikaar_rights_queries');

    if (localRti) {
      setRtiDrafts(JSON.parse(localRti));
    } else {
      setRtiDrafts(DEFAULT_RTI_DRAFTS);
    }

    if (localRights) {
      setRightsQueries(JSON.parse(localRights));
    } else {
      setRightsQueries(DEFAULT_RIGHTS_QUERIES);
    }
  }, []);

  function handleDeleteRti(id) {
    const filtered = rtiDrafts.filter(d => d.id !== id);
    setRtiDrafts(filtered);
    if (!DEFAULT_RTI_DRAFTS.some(d => d.id === id)) {
      localStorage.setItem('adhikaar_rti_drafts', JSON.stringify(filtered));
    }
  }

  function handleDeleteRights(id) {
    const filtered = rightsQueries.filter(q => q.id !== id);
    setRightsQueries(filtered);
    if (!DEFAULT_RIGHTS_QUERIES.some(q => q.id === id)) {
      localStorage.setItem('adhikaar_rights_queries', JSON.stringify(filtered));
    }
  }

  function handleRtiResume(draft) {
    navigate('/rti', {
      state: {
        query: draft.query,
        applicant: draft.applicant,
        preloadedResult: draft.applicationText ? {
          application_text: draft.applicationText,
          pdf_base64: draft.pdfBase64,
          department: draft.department,
          citations: draft.citations || [],
        } : null
      }
    });
  }

  function handleRightsResume(queryItem) {
    navigate('/rights', {
      state: {
        query: queryItem.query,
        category: queryItem.category ? queryItem.category.toLowerCase() : '',
        preloadedResult: queryItem.explanation ? {
          explanation: queryItem.explanation,
          steps: queryItem.steps,
          citations: queryItem.citations,
          category: queryItem.category,
        } : null
      }
    });
  }

  async function handleSaveName() {
    if (!newName.trim()) return;
    setNameLoading(true);
    setNameMsg('');
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await readApiResponse(res, 'Failed to update name.');
      await refreshUser();
      setNameMsg('Name updated successfully!');
      setEditingName(false);
    } catch (err) {
      setNameMsg(err.message || 'Failed to update profile.');
    } finally {
      setNameLoading(false);
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recent';

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-page__main">
        <div className="container dashboard-page__container">

          {/* Header Banner */}
          <header className="dashboard-header anim-fade-up">
            <div className="dashboard-header__left">
              <p className="hero__eyebrow text-gold tracking-wider uppercase text-xs fw-semibold">
                Citizen Command Center · Adhikaar AI
              </p>
              <span className="gold-rule-short" style={{ marginBottom: 'var(--space-4)' }} />
              <h1 className="dashboard-header__title font-display">
                Welcome back, {user?.name || 'Citizen'}.
              </h1>
              <p className="dashboard-header__subtitle">
                Your legal empowerment dashboard. Track your RTI drafts, review analyzed legal disputes, and manage your account.
              </p>
            </div>

            <div className="dashboard-header__user-pill card">
              <div className="dashboard-header__avatar">
                {initials}
              </div>
              <div className="dashboard-header__user-info">
                <p className="dashboard-header__user-name font-display">{user?.name}</p>
                <p className="dashboard-header__user-email text-xs text-muted">{user?.email}</p>
                <span className="badge badge-gold text-xs" style={{ marginTop: 'var(--space-1)' }}>
                  Member since {joinDate}
                </span>
              </div>
            </div>
          </header>

          <span className="gold-rule anim-fade-up delay-1" style={{ margin: 'var(--space-8) 0' }} />

          {/* Key Metrics Row */}
          <section className="dashboard-stats anim-fade-up delay-1">
            <div className="stat-card card card-hover">
              <p className="stat-card__number font-display text-blue-deep">{user?.rtiCount ?? rtiDrafts.length}</p>
              <p className="stat-card__label text-xs fw-semibold tracking-wider uppercase text-muted">RTI Drafts</p>
            </div>
            <div className="stat-card card card-hover">
              <p className="stat-card__number font-display text-gold">{user?.rightsCount ?? rightsQueries.length}</p>
              <p className="stat-card__label text-xs fw-semibold tracking-wider uppercase text-muted">Disputes Analyzed</p>
            </div>
            <div className="stat-card card card-hover">
              <p className="stat-card__number font-display text-ink">{user?.citationsCount ?? 4}</p>
              <p className="stat-card__label text-xs fw-semibold tracking-wider uppercase text-muted">Citations Found</p>
            </div>
            <div className="stat-card card card-hover">
              <p className="stat-card__number font-display text-muted">
                {user?.createdAt ? Math.max(1, Math.floor((Date.now() - new Date(user.createdAt)) / 86400000)) : 1}
              </p>
              <p className="stat-card__label text-xs fw-semibold tracking-wider uppercase text-muted">Days Active</p>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section className="dashboard-actions section-sm anim-fade-up delay-2">
            <div className="dashboard-actions__intro">
              <h2 className="dashboard-actions__heading font-display">Civic &amp; Legal Tools</h2>
              <span className="gold-rule-short" style={{ margin: 'var(--space-2) 0 var(--space-6)' }} />
            </div>

            <div className="dashboard-grid">
              {/* Tool 01 */}
              <div className="dashboard-tool-card card card-hover">
                <div className="dashboard-tool-card__header">
                  <div className="dashboard-tool-card__icon-wrap">
                    <IconDocument />
                  </div>
                  <span className="badge badge-gold">RTI Act, 2005</span>
                </div>
                <h3 className="dashboard-tool-card__title font-display">RTI Drafting Assistant</h3>
                <p className="dashboard-tool-card__desc text-muted">
                  Request information from public authorities under the RTI Act, 2005. Describe your request, and our AI formats a formal application.
                </p>
                <Link to="/rti" className="btn btn-primary dashboard-tool-card__btn">
                  Draft New Application →
                </Link>
              </div>

              {/* Tool 02 */}
              <div className="dashboard-tool-card card card-hover">
                <div className="dashboard-tool-card__header">
                  <div className="dashboard-tool-card__icon-wrap">
                    <IconCompass />
                  </div>
                  <span className="badge badge-blue">Rights Guidance</span>
                </div>
                <h3 className="dashboard-tool-card__title font-display">Rights Navigator</h3>
                <p className="dashboard-tool-card__desc text-muted">
                  Analyze your everyday disputes (Tenant, Consumer, Workplace, Harassment). Discover statutory rights and actionable steps.
                </p>
                <Link to="/rights" className="btn btn-primary dashboard-tool-card__btn">
                  Analyze a Dispute →
                </Link>
              </div>

              {/* Tool 03 */}
              <div className="dashboard-tool-card card card-hover">
                <div className="dashboard-tool-card__header">
                  <div className="dashboard-tool-card__icon-wrap">
                    <IconBook />
                  </div>
                  <span className="badge badge-ink">System Architecture</span>
                </div>
                <h3 className="dashboard-tool-card__title font-display">Grounding &amp; RAG Index</h3>
                <p className="dashboard-tool-card__desc text-muted">
                  Learn how our retrieval system indexes Indian central and state acts to deliver zero-hallucination legal answers.
                </p>
                <Link to="/how-it-works" className="btn btn-outline dashboard-tool-card__btn">
                  View Covered Statutes →
                </Link>
              </div>
            </div>
          </section>

          {/* Activity & Profile Panel */}
          <section className="dashboard-activity anim-fade-up delay-3">
            <div className="dashboard-activity__header">
              <h2 className="dashboard-activity__title font-display">Workspace &amp; Activity</h2>
              <div className="dashboard-activity__tabs" role="tablist" aria-label="Activity sections">
                <button
                  role="tab"
                  id="tab-rti-activity"
                  aria-selected={activeTab === 'rti'}
                  className={`dashboard-activity__tab ${activeTab === 'rti' ? 'dashboard-activity__tab--active' : ''}`}
                  onClick={() => setActiveTab('rti')}
                >
                  RTI Drafts ({rtiDrafts.length})
                </button>
                <button
                  role="tab"
                  id="tab-rights-activity"
                  aria-selected={activeTab === 'rights'}
                  className={`dashboard-activity__tab ${activeTab === 'rights' ? 'dashboard-activity__tab--active' : ''}`}
                  onClick={() => setActiveTab('rights')}
                >
                  Dispute History ({rightsQueries.length})
                </button>
                <button
                  role="tab"
                  id="tab-profile-activity"
                  aria-selected={activeTab === 'profile'}
                  className={`dashboard-activity__tab ${activeTab === 'profile' ? 'dashboard-activity__tab--active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Account Profile
                </button>
              </div>
            </div>

            <div className="dashboard-activity__content card">
              {activeTab === 'rti' && (
                rtiDrafts.length === 0 ? (
                  <div className="dashboard-activity__empty">
                    <IconGavel />
                    <p className="font-display">No RTI drafts created yet</p>
                    <Link to="/rti" className="btn btn-outline btn-sm">Draft Your First RTI</Link>
                  </div>
                ) : (
                  <div className="activity-list">
                    {rtiDrafts.map((draft) => (
                      <div key={draft.id} className="activity-item">
                        <div className="activity-item__left">
                          <span className="activity-item__icon-wrap">
                            <IconDocument />
                          </span>
                          <div className="activity-item__details">
                            <p className="activity-item__query font-display">"{draft.query}"</p>
                            <p className="activity-item__meta text-xs text-muted">
                              <span className="badge badge-ink">{draft.department}</span>
                              <span className="activity-item__meta-sep">•</span>
                              <span className="activity-item__date">
                                <IconClock /> {draft.date}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="activity-item__actions">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRtiResume(draft)}
                          >
                            Open &amp; Resume
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteRti(draft.id)}
                            aria-label="Delete draft"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'rights' && (
                rightsQueries.length === 0 ? (
                  <div className="dashboard-activity__empty">
                    <IconGavel />
                    <p className="font-display">No dispute history recorded</p>
                    <Link to="/rights" className="btn btn-outline btn-sm">Start Dispute Analysis</Link>
                  </div>
                ) : (
                  <div className="activity-list">
                    {rightsQueries.map((q) => (
                      <div key={q.id} className="activity-item">
                        <div className="activity-item__left">
                          <span className="activity-item__icon-wrap">
                            <IconCompass />
                          </span>
                          <div className="activity-item__details">
                            <p className="activity-item__query font-display">"{q.query}"</p>
                            <p className="activity-item__meta text-xs text-muted">
                              <span className="badge badge-blue">{q.category}</span>
                              <span className="activity-item__meta-sep">•</span>
                              <span className="activity-item__date">
                                <IconClock /> {q.date}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="activity-item__actions">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRightsResume(q)}
                          >
                            View Guidance
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteRights(q.id)}
                            aria-label="Delete query"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'profile' && (
                <div className="profile-manager">
                  <div className="profile-manager__header">
                    <div className="profile-manager__avatar font-display">
                      {initials}
                    </div>
                    <div>
                      <h3 className="profile-manager__title font-display">{user?.name}</h3>
                      <p className="text-sm text-muted">{user?.email}</p>
                    </div>
                  </div>

                  <hr className="gold-rule" style={{ margin: 'var(--space-6) 0' }} />

                  <div className="profile-manager__fields">
                    <div className="profile-field">
                      <label className="form-label">Full Name</label>
                      {editingName ? (
                        <div className="profile-field__edit-row">
                          <input
                            type="text"
                            className="form-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Your full name"
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveName}
                            disabled={nameLoading}
                          >
                            {nameLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setEditingName(false); setNameMsg(''); }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="profile-field__value-row">
                          <span className="fw-medium">{user?.name}</span>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setEditingName(true); setNewName(user?.name || ''); setNameMsg(''); }}
                          >
                            <IconEdit /> Edit Name
                          </button>
                        </div>
                      )}
                      {nameMsg && (
                        <p className={`text-xs ${nameMsg.includes('success') ? 'text-success' : 'text-error'}`} style={{ marginTop: 'var(--space-2)' }}>
                          {nameMsg}
                        </p>
                      )}
                    </div>

                    <div className="profile-field">
                      <label className="form-label">Registered Email</label>
                      <div className="profile-field__value-row">
                        <span className="fw-medium">{user?.email}</span>
                        <span className="badge badge-gold">
                          <IconCheck /> Verified User
                        </span>
                      </div>
                    </div>

                    <div className="profile-field">
                      <label className="form-label">Account Created</label>
                      <span className="text-sm text-muted">{joinDate}</span>
                    </div>
                  </div>

                  <div className="profile-manager__footer">
                    <button className="btn btn-ghost" onClick={logout}>
                      Sign Out of Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Quick Legal Resources */}
          <section className="dashboard-resources section-sm anim-fade-up delay-4">
            <h2 className="dashboard-resources__title font-display">Official Civic Portals &amp; Helplines</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-6)' }}>
              Direct access to government filing portals and statutory legal assistance channels.
            </p>
            <div className="dashboard-resources__grid">

              <div className="resource-card card card-hover">
                <span className="badge badge-gold" style={{ marginBottom: 'var(--space-2)' }}>RTI Filing</span>
                <h3 className="resource-card__title font-display">RTI Online Portal</h3>
                <p className="resource-card__desc text-sm text-muted">
                  Submit RTI applications directly to Central Ministries and Departments. Standard statutory fee: ₹10.
                </p>
                <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="resource-card__link text-xs fw-semibold">
                  rtionline.gov.in <IconExternalLink />
                </a>
              </div>

              <div className="resource-card card card-hover">
                <span className="badge badge-blue" style={{ marginBottom: 'var(--space-2)' }}>Consumer Court</span>
                <h3 className="resource-card__title font-display">E-Daakhil Portal</h3>
                <p className="resource-card__desc text-sm text-muted">
                  Online consumer grievance filing under Consumer Protection Act, 2019. District commissions handle up to ₹50 Lakhs.
                </p>
                <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer" className="resource-card__link text-xs fw-semibold">
                  edaakhil.nic.in <IconExternalLink />
                </a>
              </div>

              <div className="resource-card card card-hover">
                <span className="badge badge-ink" style={{ marginBottom: 'var(--space-2)' }}>Free Legal Aid</span>
                <h3 className="resource-card__title font-display">NALSA Helpline</h3>
                <p className="resource-card__desc text-sm text-muted">
                  National Legal Services Authority provides free legal advice and representation to eligible citizens. Helpline: 15100.
                </p>
                <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="resource-card__link text-xs fw-semibold">
                  nalsa.gov.in <IconExternalLink />
                </a>
              </div>

              <div className="resource-card card card-hover">
                <span className="badge badge-gold" style={{ marginBottom: 'var(--space-2)' }}>Cyber Safety</span>
                <h3 className="resource-card__title font-display">Cyber Crime Portal</h3>
                <p className="resource-card__desc text-sm text-muted">
                  Report cyber harassment, blackmail, stalking, or online financial frauds directly to law enforcement. Helpline: 1930.
                </p>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="resource-card__link text-xs fw-semibold">
                  cybercrime.gov.in <IconExternalLink />
                </a>
              </div>

            </div>
          </section>

          <DisclaimerBanner featureName="Adhikaar Dashboard" />

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;
