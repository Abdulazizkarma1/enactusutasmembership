import React, { useState } from 'react';
import { Outlet, NavLink, useOutletContext } from 'react-router-dom';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '⬡', exact: true },
  { to: '/admin/members', label: 'Members', icon: '◈' },
];

export default function AdminLayout() {
  const { admin, logout } = useOutletContext();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--off-white)' }}>
      <aside
        style={{
          width: collapsed ? 64 : 240,
          background: '#0d1b2a',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: collapsed ? '24px 16px' : '28px 24px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'padding 0.25s',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: '#e8a920',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#0d1b2a',
            }}
          >
            E
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '0.95rem',
                  lineHeight: 1,
                }}
              >
                Enactus UTAS
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted-dark)', marginTop: 2 }}>
                Verify System
              </div>
            </div>
          )}
        </div>

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 10px' : '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 4,
                background: isActive ? 'rgba(232,169,32,0.15)' : 'transparent',
                color: isActive ? 'var(--gold-light)' : 'var(--text-muted-dark)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.88rem',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                borderLeft: isActive ? '2px solid #e8a920' : '2px solid transparent',
              })}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{n.icon}</span>
              {!collapsed && n.label}
            </NavLink>
          ))}
        </nav>

        {!collapsed && admin && (
          <div
            style={{
              margin: '0 12px 8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 4,
              }}
            >
              Signed in
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
                wordBreak: 'break-all',
              }}
            >
              {admin.email}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          style={{
            margin: '0 12px 8px',
            padding: '10px 12px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#fecaca',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {!collapsed ? 'Log out' : '⎋'}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            margin: '12px',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted-dark)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {collapsed ? '→' : '← Collapse'}
        </button>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
