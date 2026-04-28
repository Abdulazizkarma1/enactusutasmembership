import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';

/* ── Inline styles for the verification page ── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0d1b2a',
    color: 'white',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  // Decorative grid background
  grid: {
    position: 'fixed', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(232,169,32,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,169,32,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  // Top glow orbs
  orb1: {
    position: 'fixed', top: -200, right: -100,
    width: 500, height: 500,
    background: 'radial-gradient(circle, rgba(232,169,32,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', bottom: -150, left: -100,
    width: 400, height: 400,
    background: 'radial-gradient(circle, rgba(100,148,237,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative', zIndex: 1,
    maxWidth: 760, margin: '0 auto',
    padding: '40px 24px 80px',
  },
};

function StatusIcon({ status }) {
  if (status === 'active') {
    return (
      <div style={{
        width: 56, height: 56,
        background: 'rgba(34,197,94,0.12)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(34,197,94,0.3)',
        animation: 'pulse-ring 2.5s ease-in-out infinite',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.5" />
          <path d="M7.5 12l3 3 6-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{
      width: 56, height: 56,
      background: 'rgba(239,68,68,0.12)',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(239,68,68,0.3)',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
      gap: 16,
    }}>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', textAlign: 'right', fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.06em' : 'normal' }}>
        {value}
      </span>
    </div>
  );
}

export default function VerifyPage() {
  const { token } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setImgError(false);
    api.verifyToken(token)
      .then(m => {
        setMember(m);
        timerRef.current = setTimeout(() => setRevealed(true), 200);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    return () => clearTimeout(timerRef.current);
  }, [token]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const daysLeft = member ? Math.ceil((new Date(member.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpired = daysLeft < 0;

  if (loading) return (
    <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div style={styles.grid} />
      <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#e8a920', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>Verifying token…</p>
    </div>
  );

  if (error) return (
    <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={styles.grid} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 24px',
          background: 'rgba(239,68,68,0.12)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(239,68,68,0.25)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Verification Failed</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 6 }}>
          The token <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem' }}>{token}</code> is not recognized.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
          This QR code may be invalid, expired, or not yet activated. Contact Enactus UTAS for support.
        </p>
        <div style={{ marginTop: 28, padding: '12px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
          Enactus UTAS · University of Technology and Applied Sciences.
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:0.8} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .reveal { animation: slideUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .reveal-1 { animation-delay: 0.05s; }
        .reveal-2 { animation-delay: 0.15s; }
        .reveal-3 { animation-delay: 0.25s; }
        .reveal-4 { animation-delay: 0.35s; }
        .reveal-5 { animation-delay: 0.45s; }
      `}</style>

      {/* Background effects */}
      <div style={styles.grid} />
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>

        {/* ── Top nav bar ── */}
        <div className={revealed ? 'reveal reveal-1' : ''} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, background: '#e8a920', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#0d1b2a', fontSize: '0.9rem',
            }}>E</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1 }}>Enactus UTAS</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Member Verification Portal</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: member.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${member.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: 100,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: member.status === 'active' ? '#22c55e' : '#ef4444',
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: member.status === 'active' ? '#4ade80' : '#f87171', letterSpacing: '0.04em' }}>
              {member.status === 'active' ? 'VERIFIED ACTIVE' : 'INACTIVE MEMBER'}
            </span>
          </div>
        </div>

        {/* ── Hero: Photo + Name ── */}
        <div className={revealed ? 'reveal reveal-2' : ''} style={{
          display: 'flex', gap: 28, alignItems: 'flex-start',
          padding: '32px 32px 28px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Gold corner accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 120, height: 120,
            background: 'radial-gradient(circle at top right, rgba(232,169,32,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Photo */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            {member.photo && !imgError ? (
              <img
                src={member.photo}
                alt={member.name}
                onError={() => setImgError(true)}
                style={{
                  width: 110, height: 130,
                  objectFit: 'cover',
                  borderRadius: 14,
                  border: '2px solid rgba(232,169,32,0.3)',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: 110, height: 130,
                borderRadius: 14,
                background: 'rgba(232,169,32,0.1)',
                border: '2px solid rgba(232,169,32,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800, fontSize: '2rem',
                color: '#e8a920',
              }}>
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            {/* Status indicator on photo */}
            <div style={{
              position: 'absolute', bottom: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: member.status === 'active' ? '#22c55e' : '#ef4444',
              border: '3px solid #0d1b2a',
            }} />
          </div>

          {/* Name & primary info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: '#e8a920', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              {member.faculty || 'Enactus UTAS Member'}
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 8,
              background: 'linear-gradient(135deg, #ffffff 60%, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {member.name}
            </h1>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'rgba(232,169,32,0.1)',
              border: '1px solid rgba(232,169,32,0.2)',
              borderRadius: 100,
              fontSize: '0.82rem', color: '#f5c842', fontWeight: 500,
              marginBottom: 14,
            }}>
              {member.role}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { label: 'Department', value: member.department },
                { label: 'Member ID', value: member.membershipId, mono: true },
              ].map(({ label, value, mono }) => value && (
                <div key={label}>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Status card ── */}
        <div className={revealed ? 'reveal reveal-3' : ''} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {/* Membership status */}
          <div style={{
            padding: '20px 22px',
            background: member.status === 'active' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${member.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <StatusIcon status={member.status} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Status</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: member.status === 'active' ? '#4ade80' : '#f87171' }}>
                {member.status === 'active' ? 'Active Member' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Token */}
          <div style={{
            padding: '20px 22px',
            background: 'rgba(232,169,32,0.06)',
            border: '1px solid rgba(232,169,32,0.15)',
            borderRadius: 14,
          }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Verification Token</div>
            <code style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#e8a920', fontWeight: 700, letterSpacing: '0.1em' }}>
              {member.token}
            </code>
          </div>
        </div>

        {/* ── Membership validity ── */}
        <div className={revealed ? 'reveal reveal-3' : ''} style={{
          padding: '20px 24px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Membership Period</span>
            {!isExpired && member.status === 'active' && (
              <span style={{ fontSize: '0.75rem', color: daysLeft < 30 ? '#fbbf24' : '#4ade80', background: daysLeft < 30 ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)', padding: '3px 10px', borderRadius: 100 }}>
                {daysLeft} days remaining
              </span>
            )}
            {isExpired && <span style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '3px 10px', borderRadius: 100 }}>Expired</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Joined</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{fmtDate(member.joinDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Valid Until</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, color: isExpired ? '#f87171' : 'rgba(255,255,255,0.9)' }}>{fmtDate(member.expiryDate)}</div>
            </div>
          </div>
        </div>

        {/* ── Contact info ── */}
        {(member.email || member.phone) && (
          <div className={revealed ? 'reveal reveal-3' : ''} style={{
            padding: '20px 24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, marginBottom: 20,
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              Contact Information
            </div>
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Phone" value={member.phone} />
          </div>
        )}

        {/* ── Contributions ── */}
        {member.contributions?.length > 0 && (
          <div className={revealed ? 'reveal reveal-4' : ''} style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem',
              marginBottom: 14, paddingBottom: 10,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              Projects & Contributions
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>
                {member.contributions.length} project{member.contributions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {member.contributions.map((c, i) => (
                <div key={i} style={{
                  padding: '18px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  borderLeft: '3px solid rgba(232,169,32,0.5)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)' }}>{c.project}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.year && (
                        <span style={{ fontSize: '0.72rem', color: '#e8a920', background: 'rgba(232,169,32,0.1)', padding: '3px 9px', borderRadius: 100, fontWeight: 600 }}>
                          {c.year}
                        </span>
                      )}
                      {c.role && (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', padding: '3px 9px', borderRadius: 100 }}>
                          {c.role}
                        </span>
                      )}
                    </div>
                  </div>
                  {c.impact && (
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                      {c.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── President's Remark ── */}
        {member.presidentRemark && (
          <div className={revealed ? 'reveal reveal-5' : ''} style={{
            padding: '24px 28px',
            background: 'rgba(232,169,32,0.04)',
            border: '1px solid rgba(232,169,32,0.15)',
            borderRadius: 16,
            marginBottom: 28,
            position: 'relative',
          }}>
            {/* Quotation mark */}
            <div style={{
              position: 'absolute', top: 16, left: 20,
              fontFamily: 'Georgia, serif',
              fontSize: '4rem', color: 'rgba(232,169,32,0.15)',
              lineHeight: 1, userSelect: 'none',
            }}>"</div>

            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: '0.72rem', color: '#e8a920', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                President's Remark
              </div>
              <p style={{
                fontSize: '0.92rem', lineHeight: 1.75,
                color: 'rgba(255,255,255,0.75)',
                fontStyle: 'italic',
                marginBottom: 16,
              }}>
                {member.presidentRemark}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 1, background: 'rgba(232,169,32,0.4)' }} />
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                  Enactus UTAS President · {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className={revealed ? 'reveal reveal-5' : ''} style={{
          textAlign: 'center',
          padding: '24px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Verified by
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
            Enactus University of Technology and Applied Sciences
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
            This page confirms the identity and membership status of the individual listed above.
            Verified on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </div>
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 100 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            <code style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{token}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
