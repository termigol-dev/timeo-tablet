import React, { useEffect, useState } from 'react';
import TabletApp from './tablet/TabletApp';

export default function App() {
  // 🌙 Estado global compartido
  const [dark, setDark] = useState(
    localStorage.getItem('dark_mode') === 'true'
  );

  // 🌙 Aplicar modo oscuro global
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('dark_mode', dark);
  }, [dark]);

  return <TabletApp />;
}