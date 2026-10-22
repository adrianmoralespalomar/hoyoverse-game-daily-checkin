import type { AlertRule } from '../models/alert-rule.interface.ts';
import { DAY_MS } from '../models/day-ms.const.ts';
import { WISH_IMPORT_EXPIRY } from '../models/wish-import-expiry.const.ts';

/**
 * Lo que se tiró después de la última importación empieza a caducar a los `retentionDays`. No avisa si nunca se ha
 * importado (no hay nada que perder todavía).
 */
export const wishImportExpiryAlertRule: AlertRule = {
  id: 'wish-import-expiry',
  label: 'Importar las tiradas antes de que caduquen',
  description: `El juego solo guarda unos 6 meses de historial. Avisa cuando faltan ${WISH_IMPORT_EXPIRY.warningLeadDays} días para perder tiradas sin importar.`,
  evaluate: ({ now, games }) => games.flatMap(game => {
    const updatedAt = game.wishes?.summary?.updatedAt;
    if (!updatedAt) return [];
    const daysLeft = Math.ceil((Date.parse(updatedAt) + WISH_IMPORT_EXPIRY.retentionDays * DAY_MS - now) / DAY_MS);
    if (daysLeft > WISH_IMPORT_EXPIRY.warningLeadDays) return [];
    const isExpired = daysLeft <= 0;
    return [{
      id: `${wishImportExpiryAlertRule.id}:${game.id}`,
      gameId: game.id,
      severity: isExpired ? 'error' : 'warning',
      title: `Importa las tiradas de ${game.name}`,
      message: isExpired
        ? 'Hace más de 6 meses de tu última importación: puedes haber perdido tiradas. Importa ya para salvar las que queden.'
        : `Tu última importación va a cumplir 6 meses y el juego borra lo anterior. Te ${daysLeft === 1 ? 'queda 1 día' : `quedan ${daysLeft} días`} para no perder tiradas: importa el historial.`,
      href: `#${game.id}`,
    }];
  }),
};
