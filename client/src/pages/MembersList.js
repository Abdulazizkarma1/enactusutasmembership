import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function QRModal({ member, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getQR(member.id)
      .then(setQrData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [member.id]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `${member.name.replace(/\s+/g, '_')}_QR.png`;
    link.href = qrData.qr;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px',
        maxWidth: 420, width: '100%', boxShadow: 'var(--shadow-lg)',
        animation: 'fadeIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>QR Code</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate)', marginTop: 2 }}>{member.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: 'var(--slate)', lineHeight: 1 }}>×</button>
        </div>

        {loading ? (
          <div className="skeleton" style={{ width: 280, height: 280, margin: '0 auto' }} />
        ) : qrData ? (
          <>
            <div style={{
              background: 'var(--navy)', padding: 20, borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              marginBottom: 20,
            }}>
              <img src={qrData.qr} alt="QR Code" style={{ width: 240, height: 240, borderRadius: 8, background: 'white', padding: 8 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', fontSize: '0.9rem' }}>
                  {member.token}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Enactus UTAS · {new Date().getFullYear()}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20, padding: '10px 14px', background: 'var(--off-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate)', marginBottom: 2 }}>Verification URL</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--navy)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{qrData.url}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={download} style={{
                flex: 1, padding: '12px', background: 'var(--navy)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem',
              }}>
                ↓ Download PNG
              </button>
              <button onClick={() => navigator.clipboard.writeText(qrData.url)} style={{
                padding: '12px 16px', background: 'white', color: 'var(--navy)',
                border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem',
              }}>
                Copy URL
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--red)', textAlign: 'center' }}>Failed to generate QR code</p>
        )}
      </div>
    </div>
  );
}

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrMember, setQrMember] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadMembers = useCallback(() => {
    setLoading(true);
    api.getMembers()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.department.toLowerCase().includes(q) || m.token.toLowerCase().includes(q) || m.membershipId.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.deleteMember(id);
      loadMembers();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1200 }} className="fade-in">
      {qrMember && <QRModal member={qrMember} onClose={() => setQrMember(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy)' }}>Members</h1>
          <p style={{ color: 'var(--slate)', marginTop: 4, fontSize: '0.9rem' }}>
            {members.length} registered · {members.filter(m => m.status === 'active').length} active
          </p>
        </div>
        <Link to="/admin/members/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 22px', background: 'var(--navy)', color: 'white',
          borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.88rem', boxShadow: 'var(--shadow-md)',
        }}>
          + Add Member
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-light)', fontSize: '0.9rem' }}>⌕</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, role, department, token..."
            style={{
              width: '100%', padding: '10px 14px 10px 34px',
              border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem', background: 'white', color: 'var(--navy)',
            }}
          />
        </div>
        {['all', 'active', 'inactive'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '10px 18px',
            background: statusFilter === s ? 'var(--navy)' : 'white',
            color: statusFilter === s ? 'white' : 'var(--slate)',
            border: '1px solid ' + (statusFilter === s ? 'var(--navy)' : 'var(--border-light)'),
            borderRadius: 'var(--radius-md)', fontWeight: 500, fontSize: '0.85rem',
            textTransform: 'capitalize',
          }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
      }}>
        {loading ? (
          <div style={{ padding: 32 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--slate)' }}>
            {search ? 'No members match your search.' : 'No members yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--off-white)' }}>
                  {['Member', 'Role', 'Department', 'Status', 'Token', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={m.photo} alt={m.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)', display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          <div style={{ display: 'none', width: 40, height: 40, borderRadius: '50%', background: 'var(--gold-pale)', color: '#92660a', fontWeight: 700, fontSize: '0.82rem', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--gold-pale)' }}>
                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--navy)' }}>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-light)' }}>{m.membershipId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.83rem', color: 'var(--slate)', maxWidth: 160 }}>{m.role}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.83rem', color: 'var(--slate)', maxWidth: 180 }}>{m.department}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${m.status}`}><span className="dot" />{m.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ fontSize: '0.75rem', background: 'var(--off-white)', padding: '3px 7px', borderRadius: 4, color: 'var(--navy)', border: '1px solid var(--border-light)' }}>{m.token}</code>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--slate)', whiteSpace: 'nowrap' }}>
                      {new Date(m.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setQrMember(m)} title="View QR Code" style={{
                          padding: '6px 11px', background: 'var(--gold-pale)', color: '#92660a',
                          border: '1px solid #f5c842', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                        }}>QR</button>
                        <Link to={`/admin/members/${m.id}/edit`} style={{
                          padding: '6px 11px', background: 'var(--off-white)', color: 'var(--navy)',
                          border: '1px solid var(--border-light)', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500,
                          display: 'inline-block',
                        }}>Edit</Link>
                        <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} title="Delete" style={{
                          padding: '6px 10px', background: '#fff0f0', color: 'var(--red)',
                          border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                          opacity: deleting === m.id ? 0.5 : 1,
                        }}>
                          {deleting === m.id ? '…' : '✕'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
