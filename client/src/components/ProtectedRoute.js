import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { admin, loading, logout } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'var(--off-white)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 0.85s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.88rem', color: 'var(--slate)' }}>Checking session…</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ admin, logout }} />;
}
