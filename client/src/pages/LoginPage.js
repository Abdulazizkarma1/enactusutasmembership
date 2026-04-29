import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyIn, setAlreadyIn] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then(() => {
        if (!cancelled) setAlreadyIn(true);
      })
      .catch(() => {
        if (!cancelled) setAlreadyIn(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0d1b2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid rgba(255,255,255,0.12)',
            borderTopColor: '#e8a920',
            borderRadius: '50%',
            animation: 'spin 0.85s linear infinite',
          }}
        />
      </div>
    );
  }

  if (alreadyIn) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.92)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1b2a',
        color: 'white',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(232,169,32,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,169,32,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .login-orb {
          position: fixed; width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,169,32,0.14) 0%, transparent 70%);
          top: -120px; right: -80px; pointer-events: none;
        }
        .login-error-box {
          animation: loginShake 0.45s ease;
        }
      `}</style>

      <div className="login-grid" />
      <div className="login-orb" />

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
          animation: 'loginFadeIn 0.5s ease both',
        }}
      >
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              margin: '0 auto 16px',
              background: '#e8a920',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.35rem',
              color: '#0d1b2a',
              boxShadow: '0 8px 32px rgba(232,169,32,0.25)',
            }}
          >
            E
          </div>
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.45rem',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            Enactus UTAS
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
            Member Verification — Admin Sign in
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 28px 32px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          }}
        >
          {error ? (
            <div
              className="login-error-box"
              role="alert"
              style={{
                marginBottom: 18,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#fecaca',
                fontSize: '0.82rem',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          ) : null}

          <label style={{ display: 'block', marginBottom: 8 }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: 8,
              }}
            >
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@utas.edu.gh"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 22 }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: 8,
              }}
            >
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px 16px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: submitting ? 'rgba(232,169,32,0.5)' : '#e8a920',
              color: '#0d1b2a',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: '0 4px 20px rgba(232,169,32,0.3)',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 22,
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          Enactus University of Technolgy and Applied Sciences.
        </p>
      </div>
    </div>
  );
}
