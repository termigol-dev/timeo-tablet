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

  /* 🌙 modo oscuro tablet */
  const [dark, setDark] = useState(
    localStorage.getItem('dark_mode') === 'true'
  );

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('dark_mode', dark);
  }, [dark]);

  /* ===============================
     CARGA CONTEXTO (EMPRESA + SUCURSAL)
  =============================== */
  async function loadContext() {
    try {
      const data = await getTabletContext();
      setContext(data);
    } catch {
      console.warn('⚠️ No se pudo cargar contexto tablet');
    }
  }

  /* ===============================
     CARGA EMPLEADOS
  =============================== */
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

  /* ===============================
     OPTIMISTIC UI
  =============================== */
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

  return (
    <div
      className="tablet-home"
      style={{
        minHeight: '100vh',
        background: dark ? '#0f172a' : '#f8fafc',
        color: dark ? '#e5e7eb' : '#0f172a',
      }}
    >
      {/* ───────── HEADER ───────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: dark ? '#020617' : '#ffffff',
          borderBottom: '1px solid',
          borderColor: dark ? '#1e293b' : '#e5e7eb',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {/* LOGO IZQUIERDA */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            t<span style={{ color: '#22c55e' }}>i</span>meo
          </div>

          {/* TÍTULO CENTRO */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 600,
              opacity: 0.7,
            }}
          >
            {context?.company?.commercialName || '—'} ·{' '}
            {context?.branch?.name || '—'}
          </div>

          {/* BOTONES DERECHA */}
          <div style={{ display: 'flex', gap: 14 }}>
            <button
              onClick={() => setDark(d => !d)}
              style={{
                background: dark
                  ? 'rgba(30,41,59,0.65)'
                  : 'rgba(226,232,240,0.8)',
                color: dark ? '#e5e7eb' : '#0f172a',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {dark ? '🌙 Oscuro' : '☀️ Claro'}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('tablet_token');
                onInvalidToken();
              }}
              style={{
                background: dark
                  ? 'rgba(30,41,59,0.65)'
                  : 'rgba(226,232,240,0.8)',
                color: dark ? '#e5e7eb' : '#0f172a',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ⛔ Desactivar
            </button>
          </div>
        </div>
      </header>

      {/* ───────── CONTENIDO ───────── */}
      <main style={{ padding: 24 }}>
        {employees.length === 0 && (
          <p style={{ opacity: 0.6 }}>
            No hay empleados activos en esta sucursal
          </p>
        )}

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
                padding: 22,
                marginBottom: 18,
                borderRadius: 16,
                background: dark ? '#020617' : '#ffffff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* FOTO */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#cbd5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#475569',
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
                  (user.name?.[0] || '') + (user.firstSurname?.[0] || '')
                )}
              </div>

              {/* NOMBRE + ESTADO */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22 }}>
                  {user.name} {user.firstSurname}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 16,
                    fontWeight: 700,
                    color: isIn ? '#16a34a' : '#dc2626',
                  }}
                >
                  {isIn ? 'IN' : 'OUT'}
                </div>
              </div>

              {/* BOTONES */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => handleIn(user.id)}
                  disabled={isIn}
                  style={{
                    minWidth: 140,
                    padding: '16px 28px',
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
                    minWidth: 140,
                    padding: '16px 28px',
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
      <footer
  style={{
    textAlign: 'center',
    padding: '24px 0',
    fontSize: 13,
    opacity: 0.5,
  }}
>
  <div style={{ fontWeight: 600 }}>
    t<span style={{ color: '#22c55e' }}>i</span>meo
  </div>
  <div>© {new Date().getFullYear()} Timeo</div>
</footer>
    </div>
  );
}