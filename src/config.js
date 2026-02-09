export const CONFIG = {
  API_BASE: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  inactivity: {
    defaultMinutes: 5,
    options: [1, 2, 5, 10, 15, 30],
  },

  refresh: {
    defaultSeconds: 30,
    options: [0, 10, 30, 60, 120],
  },

  messages: {
    in: 'Fichaje registrado',
    out: 'Salida registrada',
    inactive: 'Sesión cerrada por inactividad',
    refreshError: 'Error refrescando empleados',
    recordError: 'Error al fichar',
  },

  colors: {
    success: 'bg-emerald-600',
    danger: 'bg-red-600',
    time: 'text-teal-500',
  },

  labels: {
    in: 'IN',
    out: 'OUT',
    lastIn: 'Último registro a las',
    lastOut: 'Última salida a las',
  },
};
