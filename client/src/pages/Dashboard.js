import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-light)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
        background: accent || 'var(--gold)',
        borderRadius: '4px 0 0 4px',
      }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--slate)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.78rem', color: 'var(--slate-light)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoadError('');
    Promise.all([api.getStats(), api.getMembers()])
      .then(([s, m]) => {
        setStats(s);
        setMembers(m.slice(0, 5));
      })
      .catch((err) => {
        console.error(err);
        setLoadError(err.message || 'Could not load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100 }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--slate)', fontWeight: 500 }}>System Online</span>
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--slate)', marginTop: 4, fontSize: '0.9rem' }}>
          Enactus UTAS Member Verification System — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loadError ? (
        <div
          style={{
            marginBottom: 24,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.88rem',
          }}
        >
          {loadError}
        </div>
      ) : null}

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          <StatCard label="Total Members" value={stats?.total || 0} sub="All registered members" accent="var(--gold)" />
          <StatCard label="Active Members" value={stats?.active || 0} sub="Currently active" accent="var(--green)" />
          <StatCard label="Inactive" value={stats?.inactive || 0} sub="Suspended / Expired" accent="var(--red)" />
          <StatCard label="Departments" value={stats?.departments || 0} sub="Across the university" accent="#6366f1" />
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <Link to="/admin/members/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 22px',
          background: 'var(--navy)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: 'var(--shadow-md)',
          transition: 'transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '1rem' }}>+</span> Add New Member
        </Link>
        <Link to="/admin/members" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 22px',
          background: 'white',
          color: 'var(--navy)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          fontSize: '0.88rem',
          transition: 'transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          View All Members →
        </Link>
      </div>

      {/* Recent members */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
          Recent Members
        </h2>
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {loading ? (
            <div style={{ padding: 24 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate)' }}>
              No members yet. <Link to="/admin/members/new" style={{ color: 'var(--gold)', fontWeight: 600 }}>Add the first one →</Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--off-white)' }}>
                  {['Member', 'Role', 'Department', 'Status', 'Token'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={m.photo} alt={m.name}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                        <div style={{ display: 'none', width: 38, height: 38, borderRadius: '50%', background: 'var(--gold-pale)', color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--gold-pale)', flexShrink: 0 }}>
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--navy)' }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-light)' }}>{m.membershipId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--slate)' }}>{m.role}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--slate)' }}>{m.department}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge badge-${m.status}`}><span className="dot" />{m.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <code style={{ fontSize: '0.78rem', background: 'var(--off-white)', padding: '3px 8px', borderRadius: 4, color: 'var(--slate)', border: '1px solid var(--border-light)' }}>{m.token}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
