'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';
import type { Motivation, Subscriber } from '@/lib/types';

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Tabs
    const [activeTab, setActiveTab] = useState<'motivations' | 'subscribers'>('motivations');

    // Motivations
    const [motivations, setMotivations] = useState<Motivation[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [totalMotivations, setTotalMotivations] = useState(0);
    const [motLoading, setMotLoading] = useState(false);

    // Stats
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

    // Subscribers
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [subLoading, setSubLoading] = useState(false);

    // Edit
    const [editingMotivation, setEditingMotivation] = useState<Motivation | null>(null);
    const [editText, setEditText] = useState('');
    const [editAuthor, setEditAuthor] = useState('');

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }), [token]);

    // Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setLoginError(data.error || 'Invalid password');
                return;
            }

            setToken(data.token);
            setAuthenticated(true);
        } catch {
            setLoginError('Failed to authenticate');
        } finally {
            setLoginLoading(false);
        }
    };

    // Fetch Motivations
    const fetchMotivations = useCallback(async () => {
        setMotLoading(true);
        try {
            const res = await fetch(`/api/admin/motivations?status=${statusFilter}`, {
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.motivations) {
                setMotivations(data.motivations);
                setTotalMotivations(data.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch motivations:', err);
        } finally {
            setMotLoading(false);
        }
    }, [statusFilter, authHeaders]);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const statuses = ['pending', 'approved', 'rejected'];
            const results = await Promise.all(
                statuses.map(async (s) => {
                    const res = await fetch(`/api/admin/motivations?status=${s}&limit=1`, {
                        headers: authHeaders(),
                    });
                    const data = await res.json();
                    return { [s]: data.total || 0 };
                })
            );
            const merged = Object.assign({}, ...results);
            setStats({ pending: merged.pending, approved: merged.approved, rejected: merged.rejected });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, [authHeaders]);

    // Fetch Subscribers
    const fetchSubscribers = useCallback(async () => {
        setSubLoading(true);
        try {
            const res = await fetch('/api/admin/subscribers', {
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.subscribers) {
                setSubscribers(data.subscribers);
                setTotalSubscribers(data.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
        } finally {
            setSubLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        if (!authenticated) return;
        fetchMotivations();
        fetchStats();
    }, [authenticated, statusFilter, fetchMotivations, fetchStats]);

    useEffect(() => {
        if (!authenticated || activeTab !== 'subscribers') return;
        fetchSubscribers();
    }, [authenticated, activeTab, fetchSubscribers]);

    // Update motivation
    const updateMotivation = async (id: string, updates: Record<string, string>) => {
        try {
            await fetch('/api/admin/motivations', {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ id, ...updates }),
            });
            fetchMotivations();
            fetchStats();
        } catch (err) {
            console.error('Failed to update:', err);
        }
    };

    // Delete motivation
    const deleteMotivation = async (id: string) => {
        if (!confirm('Are you sure you want to delete this motivation?')) return;
        try {
            await fetch('/api/admin/motivations', {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify({ id }),
            });
            fetchMotivations();
            fetchStats();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    // Edit motivation
    const openEdit = (m: Motivation) => {
        setEditingMotivation(m);
        setEditText(m.text);
        setEditAuthor(m.author || '');
    };

    const saveEdit = async () => {
        if (!editingMotivation) return;
        await updateMotivation(editingMotivation.id, {
            text: editText,
            author: editAuthor || '',
        });
        setEditingMotivation(null);
    };

    // Export CSV
    const exportCSV = () => {
        const link = document.createElement('a');
        link.href = `/api/admin/subscribers?format=csv`;
        // We need to add auth header — use fetch instead
        fetch('/api/admin/subscribers?format=csv', {
            headers: authHeaders(),
        })
            .then((res) => res.blob())
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'subscribers.csv';
                a.click();
                URL.revokeObjectURL(url);
            });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // ── Login Screen ──
    if (!authenticated) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <div className={styles.loginIcon}>🔐</div>
                    <h1 className={styles.loginTitle}>Admin Access</h1>
                    <p className={styles.loginSubtext}>Enter your admin password to continue</p>

                    <form className={styles.loginForm} onSubmit={handleLogin}>
                        <input
                            className={styles.loginInput}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            id="admin-password"
                            autoFocus
                        />
                        {loginError && <p className={styles.loginError}>{loginError}</p>}
                        <button
                            className={styles.loginBtn}
                            type="submit"
                            disabled={loginLoading}
                            id="admin-login"
                        >
                            {loginLoading ? 'Authenticating...' : 'Enter'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Admin Dashboard ──
    return (
        <div className={styles.adminPage}>
            {/* Header */}
            <header className={styles.adminHeader}>
                <div className={styles.adminHeaderLeft}>
                    <a href="/" className={styles.backLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </a>
                    <h1 className={styles.adminTitle}>Admin Dashboard</h1>
                </div>
                <button
                    className={styles.logoutBtn}
                    onClick={() => {
                        setAuthenticated(false);
                        setToken('');
                        setPassword('');
                    }}
                    id="admin-logout"
                >
                    Logout
                </button>
            </header>

            {/* Tabs */}
            <nav className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'motivations' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('motivations')}
                    id="tab-motivations"
                >
                    Motivations
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'subscribers' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('subscribers')}
                    id="tab-subscribers"
                >
                    Subscribers
                </button>
            </nav>

            {/* Content */}
            <div className={styles.adminContent}>
                {activeTab === 'motivations' && (
                    <>
                        {/* Stats */}
                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.pending}</div>
                                <div className={styles.statLabel}>Pending</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.approved}</div>
                                <div className={styles.statLabel}>Approved</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.rejected}</div>
                                <div className={styles.statLabel}>Rejected</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{totalSubscribers || '—'}</div>
                                <div className={styles.statLabel}>Subscribers</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className={styles.filterBar}>
                            {['all', 'pending', 'approved', 'rejected'].map((f) => (
                                <button
                                    key={f}
                                    className={`${styles.filterBtn} ${statusFilter === f ? styles.filterBtnActive : ''}`}
                                    onClick={() => setStatusFilter(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                    {f !== 'all' && ` (${stats[f as keyof typeof stats] || 0})`}
                                </button>
                            ))}
                        </div>

                        {/* Motivation List */}
                        {motLoading ? (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyText}>Loading...</p>
                            </div>
                        ) : motivations.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📭</div>
                                <p className={styles.emptyText}>No motivations found</p>
                            </div>
                        ) : (
                            <div className={styles.motivationList}>
                                {motivations.map((m) => (
                                    <div key={m.id} className={styles.motivationRow}>
                                        <div className={styles.rowContent}>
                                            <div className={styles.rowText}>
                                                <p className={styles.rowMotivation}>&ldquo;{m.text}&rdquo;</p>
                                                <div className={styles.rowMeta}>
                                                    <span>By: {m.is_anonymous ? 'Anonymous' : (m.author || 'Unknown')}</span>
                                                    <span>{formatDate(m.created_at)}</span>
                                                    <span className={`${styles.statusBadge} ${m.status === 'pending' ? styles.statusPending :
                                                            m.status === 'approved' ? styles.statusApproved :
                                                                styles.statusRejected
                                                        }`}>
                                                        {m.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.rowActions}>
                                                {m.status !== 'approved' && (
                                                    <button
                                                        className={`${styles.rowBtn} ${styles.rowBtnApprove}`}
                                                        onClick={() => updateMotivation(m.id, { status: 'approved' })}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {m.status !== 'rejected' && (
                                                    <button
                                                        className={`${styles.rowBtn} ${styles.rowBtnReject}`}
                                                        onClick={() => updateMotivation(m.id, { status: 'rejected' })}
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.rowBtn}
                                                    onClick={() => openEdit(m)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={`${styles.rowBtn} ${styles.rowBtnDelete}`}
                                                    onClick={() => deleteMotivation(m.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p style={{ marginTop: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Showing {motivations.length} of {totalMotivations} motivations
                        </p>
                    </>
                )}

                {activeTab === 'subscribers' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                {totalSubscribers} subscriber{totalSubscribers !== 1 ? 's' : ''}
                            </p>
                            <button className={styles.exportBtn} onClick={exportCSV}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Export CSV
                            </button>
                        </div>

                        {subLoading ? (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyText}>Loading...</p>
                            </div>
                        ) : subscribers.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📧</div>
                                <p className={styles.emptyText}>No subscribers yet</p>
                            </div>
                        ) : (
                            <div className={styles.subscriberList}>
                                {subscribers.map((s) => (
                                    <div key={s.id} className={styles.subscriberRow}>
                                        <span className={styles.subscriberEmail}>{s.email}</span>
                                        <div className={styles.subscriberMeta}>
                                            <span className={`${styles.statusBadge} ${s.is_active ? styles.statusApproved : styles.statusRejected}`}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <span>{formatDate(s.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {editingMotivation && (
                <div className={styles.editOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setEditingMotivation(null);
                }}>
                    <div className={styles.editModal}>
                        <h2 className={styles.editTitle}>Edit Motivation</h2>
                        <textarea
                            className={styles.editTextarea}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Motivation text..."
                        />
                        <input
                            className={styles.editInput}
                            type="text"
                            value={editAuthor}
                            onChange={(e) => setEditAuthor(e.target.value)}
                            placeholder="Author name (optional)"
                        />
                        <div className={styles.editActions}>
                            <button
                                className={styles.editCancel}
                                onClick={() => setEditingMotivation(null)}
                            >
                                Cancel
                            </button>
                            <button className={styles.editSave} onClick={saveEdit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
