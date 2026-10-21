import type { CodeView } from './code-view.interface';

export const CODE_STATUS_LABELS: Record<CodeView['status'], string> = {
  pending: 'En cola',
  redeemed: 'Canjeado',
  already_redeemed: 'Ya lo tenías',
  expired: 'Caducado',
  invalid: 'No vale en EU',
  manual: 'Canjéalo a mano',
  retry: 'Reintentando',
  bad_cookie: 'Espera cookie nueva',
  failed: 'Rechazado',
};
