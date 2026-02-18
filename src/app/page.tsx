'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import styles from './page.module.css';

interface MotivationData {
  id: string;
  text: string;
  author: string | null;
}

export default function HomePage() {
  const [motivation, setMotivation] = useState<MotivationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Submit modal
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [submitAuthor, setSubmitAuthor] = useState('');
  const [submitAnonymous, setSubmitAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Subscribe
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState(false);

  // Share
  const shareRef = useRef<HTMLDivElement>(null);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('motive-theme') as 'light' | 'dark' | null;
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferred);
    document.documentElement.setAttribute('data-theme', preferred);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('motive-theme', next);
  };

  const fetchMotivation = useCallback(async () => {
    try {
      const res = await fetch('/api/motivations');
      const data = await res.json();
      if (data.motivation) {
        setMotivation(data.motivation);
      }
    } catch (err) {
      console.error('Failed to fetch motivation:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMotivation();
  }, [fetchMotivation]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setExiting(true);
    setRefreshing(true);

    // Wait for exit animation
    await new Promise((resolve) => setTimeout(resolve, 250));
    setExiting(false);
    await fetchMotivation();
  };

  const handleShare = async () => {
    if (!shareRef.current || !motivation) return;

    try {
      const dataUrl = await toPng(shareRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: 1080,
        height: 1080,
      });

      const link = document.createElement('a');
      link.download = `motive-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!motivation) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/motivations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: submitText,
          author: submitAuthor,
          is_anonymous: submitAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit');
        return;
      }

      setSubmitSuccess(true);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSubscribing(true);
    setSubscribeMessage('');
    setSubscribeError(false);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubscribeMessage(data.error || 'Failed to subscribe');
        setSubscribeError(true);
        return;
      }

      setSubscribeMessage(data.message);
      setEmail('');
      setConsent(false);
    } catch {
      setSubscribeMessage('Something went wrong. Please try again.');
      setSubscribeError(true);
    } finally {
      setSubscribing(false);
    }
  };

  const closeSubmitModal = () => {
    setShowSubmit(false);
    setSubmitText('');
    setSubmitAuthor('');
    setSubmitAnonymous(false);
    setSubmitSuccess(false);
    setSubmitError('');
  };

  const charCount = submitText.length;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>◆</div>
          <span className={styles.logoText}>Motive.</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={`${styles.themeToggle} ${theme === 'dark' ? styles.themeToggleDark : ''}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            id="theme-toggle"
          >
            <div className={styles.themeToggleThumb}>
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
          </button>
          <button
            className={styles.headerBtn}
            onClick={() => setShowSubmit(true)}
            id="submit-btn"
          >
            Submit Motivation
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className={styles.main}>
        {/* ── Motivation Display ── */}
        <section className={styles.motivationSection} aria-label="Daily motivation">
          {loading ? (
            <div className={styles.motivationCard}>
              <div className={`${styles.skeleton} ${styles.skeletonText}`} />
              <div className={`${styles.skeleton} ${styles.skeletonTextSm}`} />
              <div className={`${styles.skeleton} ${styles.skeletonAuthor}`} />
            </div>
          ) : motivation ? (
            <div
              className={`${styles.motivationCard} ${exiting ? styles.exiting : ''}`}
              key={motivation.id}
            >
              <div className={styles.quoteOpen}>&ldquo;</div>
              <blockquote className={styles.motivationText}>
                {motivation.text}
              </blockquote>
              <p className={styles.motivationAuthor}>
                — {motivation.author || 'Anonymous'}
              </p>
            </div>
          ) : (
            <div className={styles.motivationCard}>
              <p className={styles.motivationText} style={{ fontSize: '1.2rem', fontStyle: 'normal' }}>
                No motivations yet. Be the first to submit one!
              </p>
            </div>
          )}
        </section>

        {/* ── Action Bar ── */}
        <div className={styles.actionBar}>
          <button
            className={`${styles.refreshBtn} ${refreshing ? styles.refreshing : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            id="action-refresh"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh Insight
          </button>

          <div className={styles.shareGroup}>
            <span className={styles.shareLabel}>Share This</span>
            <div className={styles.shareIcons}>
              {/* X (Twitter) */}
              <button
                className={styles.shareIconBtn}
                onClick={() => {
                  if (!motivation) return;
                  const text = `"${motivation.text}" — ${motivation.author || 'Anonymous'}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
                title="Share on X"
                id="share-x"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              {/* Instagram (download image) */}
              <button
                className={styles.shareIconBtn}
                onClick={handleShare}
                title="Download for Instagram"
                id="share-instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </button>

              {/* Email */}
              <button
                className={styles.shareIconBtn}
                onClick={() => {
                  if (!motivation) return;
                  const subject = 'Daily Motivation';
                  const body = `"${motivation.text}" — ${motivation.author || 'Anonymous'}\n\nShared via Motive.`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
                title="Share via email"
                id="share-email"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </button>

              {/* Copy Link */}
              <button
                className={styles.shareIconBtn}
                onClick={handleCopyLink}
                title="Copy link"
                id="share-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Section ── */}
        <section className={styles.contentSection}>
          <h1 className={styles.contentHeading}>A Spark of Light, Daily.</h1>
          <p className={styles.contentDescription}>
            Fuel your journey with curated wisdom and daily inspiration. Join our
            community for gentle reminders that encourage growth, resilience, and
            intentional living.
          </p>

          {/* ── Subscribe ── */}
          <div className={styles.subscribeSection}>
            <p className={styles.subscribeLabel}>Where should we send your motivation?</p>
            <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
              <input
                className={styles.subscribeInput}
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="subscribe-email"
              />
              <div className={styles.consentGroup}>
                <input
                  className={styles.consentCheckbox}
                  type="checkbox"
                  id="consent-check"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <label className={styles.consentLabel} htmlFor="consent-check">
                  I consent to receive emails and agree to the{' '}
                  <a href="#privacy">Privacy Policy</a>.
                </label>
              </div>
              <button
                className={styles.subscribeBtn}
                type="submit"
                disabled={subscribing || !consent}
                id="subscribe-btn"
              >
                {subscribing ? 'Subscribing...' : 'Start My Journey'}
              </button>
            </form>
            {subscribeMessage && (
              <p className={`${styles.subscribeMessage} ${subscribeError ? styles.subscribeError : ''}`}>
                {subscribeMessage}
              </p>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>Motive.</div>
            <p className={styles.footerTagline}>
              Curating intentionality for a more mindful existence. Grounded in terracotta, inspired by the light.
            </p>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              <a href="#terms" className={styles.footerLink}>Terms</a>
              <a href="#privacy" className={styles.footerLink}>Privacy</a>
              <a href="#contact" className={styles.footerLink}>Contact</a>
            </div>
            <p className={styles.footerCopyright}>
              © {new Date().getFullYear()} Daily Motivations — All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ── Share Card (Hidden, for image generation) ── */}
      {motivation && (
        <div ref={shareRef} className={styles.shareCard}>
          <div className={styles.shareQuoteOpen}>&ldquo;</div>
          <p className={styles.shareText}>{motivation.text}</p>
          {motivation.author && (
            <p className={styles.shareAuthor}>— {motivation.author}</p>
          )}
          <div className={styles.shareBranding}>Motive.</div>
          <div className={styles.shareAccentLine} />
        </div>
      )}

      {/* ── Submit Modal ── */}
      {showSubmit && (
        <div className={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) closeSubmitModal();
        }}>
          <div className={styles.modal}>
            {submitSuccess ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>✨</div>
                <h2 className={styles.successTitle}>Thank you!</h2>
                <p className={styles.successText}>
                  Your motivation has been submitted and will be reviewed shortly.
                  If approved, it will appear for others to see.
                </p>
                <button
                  className={styles.submitBtn}
                  style={{ marginTop: 'var(--space-lg)' }}
                  onClick={closeSubmitModal}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Share a Motivation</h2>
                  <button
                    className={styles.modalCloseBtn}
                    onClick={closeSubmitModal}
                    aria-label="Close"
                    id="modal-close"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <p className={styles.modalDescription}>
                  Share a message that inspires you. Once reviewed, it may appear here
                  for someone who needs it today.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="motivation-text">
                      Your Motivation
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      id="motivation-text"
                      placeholder="Write something that inspires..."
                      value={submitText}
                      onChange={(e) => setSubmitText(e.target.value)}
                      maxLength={500}
                      required
                    />
                    <p className={`${styles.charCount} ${charCount > 450 ? styles.charCountWarn : ''} ${charCount >= 500 ? styles.charCountError : ''}`}>
                      {charCount}/500
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="author-name">
                      Your Name (optional)
                    </label>
                    <input
                      className={styles.formInput}
                      id="author-name"
                      type="text"
                      placeholder="Your name"
                      value={submitAuthor}
                      onChange={(e) => setSubmitAuthor(e.target.value)}
                      disabled={submitAnonymous}
                      maxLength={100}
                    />
                  </div>

                  <div className={styles.checkboxGroup}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      id="anonymous-toggle"
                      checked={submitAnonymous}
                      onChange={(e) => setSubmitAnonymous(e.target.checked)}
                    />
                    <label className={styles.checkboxLabel} htmlFor="anonymous-toggle">
                      Post anonymously
                    </label>
                  </div>

                  {submitError && (
                    <p className={`${styles.subscribeMessage} ${styles.subscribeError}`} style={{ marginBottom: 'var(--space-md)' }}>
                      {submitError}
                    </p>
                  )}

                  <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={submitting || submitText.trim().length < 5}
                    id="submit-motivation"
                  >
                    {submitting ? 'Submitting...' : 'Submit Motivation'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
