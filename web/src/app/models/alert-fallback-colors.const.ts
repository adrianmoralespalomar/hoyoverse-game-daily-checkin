import type { AlertSeverity } from './alert-severity.type';

/** Color de un aviso que no habla de ningún juego en concreto. */
export const ALERT_FALLBACK_COLORS: Record<AlertSeverity, string> = {
  info: '#f2eee4',
  warning: '#ffc46b',
  error: '#ff7d8c',
};
