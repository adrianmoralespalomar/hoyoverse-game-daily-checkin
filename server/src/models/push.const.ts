/** Notificaciones push. */
export const PUSH = {
  /** Contacto que pide el estándar VAPID; el servicio de notificaciones no lo usa para escribir. */
  vapidSubject: 'mailto:hoyo-games@example.com',
  /** Cuánto guarda el servicio de notificaciones un aviso si el móvil está sin red. */
  timeToLiveSeconds: 6 * 3600,
  /** Códigos de respuesta con los que el servicio dice que la suscripción ya no existe. */
  goneStatusCodes: [404, 410],
} as const;
