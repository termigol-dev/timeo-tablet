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
      
  const [fullscreen, setFullscreen] = useState(false);      
      
  useEffect(() => {      
    document.body.classList.toggle('dark', dark);      
    localStorage.setItem('dark_mode', dark);      
  }, [dark]);      
      
  async function loadContext() {      
    try {      
      const data = await getTabletContext();      
      setContext(data);      
    } catch { }      
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
      
  function toggleFullscreen() {      
    if (!document.fullscreenElement) {      
      document.documentElement.requestFullscreen();      
      setFullscreen(true);      
    } else {      
      document.exitFullscreen();      
      setFullscreen(false);      
    }      
  }      
      
  if (loading) {      
    return <div className="center">Cargando registros…</div>;      
  }      
      
  const headerButtonStyle = {      
    minWidth: 140,      
    padding: '16px 28px',      
    fontSize: 16,      
    borderRadius: 12,      
    border: 'none',      
    cursor: 'pointer',      
    background: dark ? '#1e293b' : '#e2e8f0',      
    color: dark ? '#e5e7eb' : '#0f172a',      
  };      
      
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
      
      {/* HEADER */}      
      <header      
        style={{      
          padding: '24px 24px 10px 24px',      
          borderBottom: '1px solid',      
          borderColor: dark ? '#1e293b' : '#e5e7eb',      
        }}      
      >      
        <div      
          style={{      
            maxWidth: 1200,      
            margin: '0 auto',      
            display: 'flex',      
            alignItems: 'center',      
            justifyContent: 'space-between',      
            minHeight: 88, // 👈 MISMA ALTURA VISUAL QUE TARJETAS      
            position: 'relative',      
          }}      
        >      
      
          {/* LOGO + FULLSCREEN */}      
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>      
            <div className="logo">      
              t<span>i</span>meo      
            </div>      
      
            <button      
              onClick={toggleFullscreen}      
              style={headerButtonStyle}      
            >      
              {fullscreen ? '🗗 Pantalla OFF' : '🗖 Pantalla ON'}      
            </button>      
          </div>      
      
          {/* EMPRESA + SUCURSAL CENTRADO REAL */}      
          <div      
            style={{      
              position: 'absolute',      
              left: '50%',      
              transform: 'translateX(-50%)',      
              textAlign: 'center',      
              fontSize: 22,      
              fontWeight: 700,      
            }}      
          >      
            {context?.company?.commercialName || '—'} ·{' '}      
            {context?.branch?.name || '—'}      
          </div>      
      
          {/* BOTONES DERECHA */}      
          <div style={{ display: 'flex', gap: 14 }}>      
            <button      
              onClick={() => setDark(d => !d)}      
              style={headerButtonStyle}      
            >      
              {dark ? '🌙 Oscuro' : '☀️ Claro'}      
            </button>      
      
            <button      
              onClick={() => {      
                localStorage.removeItem('tablet_token');      
                onInvalidToken();      
              }}      
              style={headerButtonStyle}      
            >      
              ⛔ Desactivar      
            </button>      
          </div>      
        </div>      
      </header>      
      
      {/* CONTENIDO */}      
      <main style={{ padding: 24, flex: 1 }}>      
      
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
      
      {/* FOOTER */}      
      <footer      
        style={{      
          textAlign: 'center',      
          padding: '20px 0',      
          fontSize: 12,      
          opacity: 0.5,      
        }}      
      >      
        <div style={{ fontWeight: 900, letterSpacing: -0.5 }}>      
          t<span style={{ color: '#22c55e' }}>i</span>meo      
        </div>      
        <div>© {new Date().getFullYear()} Timeo</div>      
      </footer>      
      
    </div>      
  );      
}