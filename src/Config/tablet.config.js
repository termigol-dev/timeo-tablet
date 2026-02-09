export const TABLET_CONFIG = {
  apiBase: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  refreshIntervalMs: 30_000, // auto refresh
  inactivityTimeoutMs: 5 * 60_000, // bloqueo por inactividad

  toastDurationMs: 2000,

  colors: {
    in: 'emerald',
    out: 'red',
    accent: 'teal',
  },

  texts: {
    inSuccess: 'Fichaje registrado',
    outSuccess: 'Salida registrada',
    lastIn: 'Último registro a las',
    lastOut: 'Última salida a las',
  },
};
