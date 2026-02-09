import React, { useState, useEffect } from 'react';
import TabletActivate from './TabletActivate';
import TabletHome from './TabletHome';

export default function TabletApp() {
  const [active, setActive] = useState(
    !!localStorage.getItem('tablet_token')
  );

  /* ───────── ACTIVACIÓN POR QR ───────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromQr = params.get('token');

    if (tokenFromQr) {
      // guardar token
      localStorage.setItem('tablet_token', tokenFromQr);
      setActive(true);

      // limpiar URL (sin router)
      window.history.replaceState(
        {},
        document.title,
        '/tablet'
      );
    }
  }, []);

  /* ───────── RENDER ───────── */
  if (!active) {
    return (
      <TabletActivate
        onActivated={() => setActive(true)}
      />
    );
  }

  return (
    <TabletHome
      onInvalidToken={() => {
        localStorage.removeItem('tablet_token');
        setActive(false);
      }}
    />
  );
}