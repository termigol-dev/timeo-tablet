import React, { useEffect, useState } from 'react';
import {
  getTabletEmployees,
  recordIn,
  recordOut,
  getTabletContext,
} from './tabletApi';

export default function TabletHome({ onInvalidToken }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);

  const [dark, setDark] = useState(
    localStorage.getItem('dark_mode') === 'true'
  );

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('dark_mode', dark);
  }, [dark]);

  async function loadContext() {
    try {
      const data = await getTabletContext();
      setContext(data);
    } catch {
      console.warn('⚠️ No se pudo cargar contexto tablet');
    }
  }

  async function load() {
    setLoading(true);
    try {
      const data = await getTabletEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.status === 401) {
        localStorage.removeItem('tablet_token');
        onInvalidToken();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContext();
    load();
  }, []);

  function updateLocalState(userId, type) {
    setEmployees(prev =>
      prev.map(m => {
        if (m.user.id !== userId) return m;

        return {
          ...m,
          user: {
            ...m.user,
            records: [
              {
                type,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        };
      }),
    );
  }

  async function handleIn(userId) {
    updateLocalState(userId, 'IN');
    try {
      await recordIn(userId);
    } catch {
      load();
    }
  }

  async function handleOut(userId) {
    updateLocalState(userId, 'OUT');
    try {
      await recordOut(userId);
    } catch {
      load();
    }
  }


  if (loading) {
    return <div className="center">Cargando registros…</div>;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dark ? '#0f172a' : '#f8fafc',
        color: dark ? '#e5e7eb' : '#0f172a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* ───────── HEADER ───────── */}
      <header
        style={{
          background: dark ? '#020617' : '#ffffff',
          borderBottom: '1px solid',
          borderColor: dark ? '#1e293b' : '#e5e7eb',
          padding: '20px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              t<span style={{ color: '#16a34a' }}>i</span>meo
            </div>

            <button
              onClick={toggleFullscreen}
              style={{
                width: 140,
                padding: '16px 0',
                fontSize: 16,
                borderRadius: 12,
                border: 'none',
                background: dark ? '#334155' : '#e2e8f0',
                color: dark ? '#e5e7eb' : '#0f172a',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Pantalla ON/OFF
            </button>

          </div>

          {/* CENTRO EMPRESA + SUCURSAL */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {context?.company?.commercialName || '—'} ·{' '}
            {context?.branch?.name || '—'}
          </div>

          {/* BOTONES DERECHA */}
          <div style={{ display: 'flex', gap: 12 }}>

            <button
              onClick={() => setDark(d => !d)}
              style={{
                width: 140,
                padding: '16px 0',
                fontSize: 16,
                borderRadius: 12,
                border: 'none',
                background: dark ? '#334155' : '#e2e8f0',
                color: dark ? '#e5e7eb' : '#0f172a',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {dark ? 'Oscuro' : 'Claro'}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('tablet_token');
                onInvalidToken();
              }}
              style={{
                width: 140,
                padding: '16px 0',
                fontSize: 16,
                borderRadius: 12,
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Desactivar
            </button>

          </div>
        </div>
      </header>

      {/* ───────── CONTENIDO ───────── */}
      <main style={{ flex: 1, padding: 40 }}>

        {employees.map(m => {
          const user = m.user;
          if (!user) return null;

          const last = user.records?.[0] ?? null;
          const isIn = last?.type === 'IN';

          return (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: 28,
                marginBottom: 22,
                borderRadius: 18,
                background: dark ? '#020617' : '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >

              {/* FOTO */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#cbd5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  (user.name?.[0] || '') +
                  (user.firstSurname?.[0] || '')
                )}
              </div>

              {/* NOMBRE + ESTADO */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  {user.name} {user.firstSurname}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 18,
                    fontWeight: 800,
                    color: isIn ? '#16a34a' : '#dc2626',
                  }}
                >
                  {isIn ? 'IN' : 'OUT'}
                </div>
              </div>

              {/* BOTONES IN OUT */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => handleIn(user.id)}
                  disabled={isIn}
                  style={{
                    width: 140,
                    padding: '16px 0',
                    fontSize: 18,
                    borderRadius: 12,
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    opacity: isIn ? 0.4 : 1,
                  }}
                >
                  IN
                </button>

                <button
                  onClick={() => handleOut(user.id)}
                  disabled={!isIn}
                  style={{
                    width: 140,
                    padding: '16px 0',
                    fontSize: 18,
                    borderRadius: 12,
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    opacity: !isIn ? 0.4 : 1,
                  }}
                >
                  OUT
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer
        style={{
          textAlign: 'center',
          padding: '28px 0',
          fontSize: 14,
          opacity: 0.6,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 20 }}>
          t<span style={{ color: '#16a34a' }}>i</span>meo
        </div>
        <div>© {new Date().getFullYear()} Timeo</div>
      </footer>

    </div>
  );
}