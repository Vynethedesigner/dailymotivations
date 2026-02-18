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
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState(false);

  // Share
  const shareRef = useRef<HTMLDivElement>(null);

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

      // Create download link
      const link = document.createElement('a');
      link.download = `daily-motivation-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
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
          <div className={styles.logoIcon}>✦</div>
          <span>Daily Motivations</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.headerBtn}
            onClick={() => setShowSubmit(true)}
            id="submit-btn"
          >
            Submit
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
              {motivation.author && (
                <p className={styles.motivationAuthor}>{motivation.author}</p>
              )}
              {!motivation.author && (
                <p className={styles.motivationAuthor}>Anonymous</p>
              )}
            </div>
          ) : (
            <div className={styles.motivationCard}>
              <p className={styles.motivationText} style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                No motivations yet. Be the first to submit one!
              </p>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={() => setShowSubmit(true)}
              title="Submit a motivation"
              id="action-submit"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className={styles.actionLabel}>Submit</span>
            </button>

            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary} ${refreshing ? styles.refreshing : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Get new motivation"
              id="action-refresh"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span className={styles.actionLabel}>New</span>
            </button>

            <button
              className={styles.actionBtn}
              onClick={handleShare}
              title="Share as image"
              id="action-share"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span className={styles.actionLabel}>Share</span>
            </button>
          </div>
        </section>

        {/* ── Subscribe Section ── */}
        <section className={styles.subscribeSection} aria-label="Subscribe to daily motivations">
          <p className={styles.subscribeLabel}>Get a daily motivation in your inbox</p>
          <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
            <input
              className={styles.subscribeInput}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="subscribe-email"
            />
            <button
              className={styles.subscribeBtn}
              type="submit"
              disabled={subscribing}
              id="subscribe-btn"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {subscribeMessage && (
            <p className={`${styles.subscribeMessage} ${subscribeError ? styles.subscribeError : ''}`}>
              {subscribeMessage}
            </p>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Built with intention · One message at a time ·{' '}
          <a href="/admin" className={styles.footerLink}>Admin</a>
        </p>
      </footer>

      {/* ── Share Card (Hidden, for image generation) ── */}
      {motivation && (
        <div ref={shareRef} className={styles.shareCard}>
          <div className={styles.shareQuoteOpen}>&ldquo;</div>
          <p className={styles.shareText}>{motivation.text}</p>
          {motivation.author && (
            <p className={styles.shareAuthor}>— {motivation.author}</p>
          )}
          <div className={styles.shareBranding}>dailymotivations.com</div>
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
