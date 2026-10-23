import type { AlertRule } from '../models/alert-rule.interface.ts';
import { DAY_MS } from '../models/day-ms.const.ts';
import { LIVESTREAM_PUSH_LEAD_MINUTES } from '../models/livestream-push-lead-minutes.const.ts';
import { LIVESTREAM_ALERT_LEAD_DAYS } from '../models/livestream-alert-lead-days.const.ts';
import { formatTimeLeft } from './format-time-left.ts';

const LIVESTREAM_TIME_FORMAT = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
const LIVESTREAM_DATE_FORMAT = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

const MINUTE_MS = 60_000;
/** Desde estos minutos se dice "media hora": el móvil avisa en la primera vuelta tras cruzar el umbral y puede faltar algo menos. */
const ROUNDED_TO_HALF_HOUR_MIN_MINUTES = 28;

/**
 * Avisa en el panel los últimos días antes del directo, con lo que queda: en él se regalan códigos que caducan pronto.
 * Al móvil solo llega cuando falta media hora, para no molestar antes.
 */
export const livestreamAlertRule: AlertRule = {
  id: 'livestream',
  label: 'Directo de la próxima versión',
  description: `Avisa en el panel ${LIVESTREAM_ALERT_LEAD_DAYS} días antes del directo de cada juego, con el tiempo que queda y la hora de Madrid, y en el móvil cuando falta media hora: suelta códigos que caducan en pocas horas.`,
  evaluate: ({ now, games, livestreams }) => games.flatMap(game => {
    const livestream = livestreams[game.id];
    const startsAt = livestream && Date.parse(livestream.startsAt);
    if (!livestream || !startsAt || startsAt <= now || startsAt - now > LIVESTREAM_ALERT_LEAD_DAYS * DAY_MS) return [];
    const minutesLeft = Math.floor((startsAt - now) / MINUTE_MS);
    const version = livestream.version ? `la ${livestream.version}` : 'la próxima versión';
    return [{
      id: `${livestreamAlertRule.id}:${game.id}:${livestream.startsAt}`,
      gameId: game.id,
      severity: 'info',
      title: `Directo de ${version}`,
      message: `Queda ${formatTimeLeft(startsAt - now)}: ${LIVESTREAM_DATE_FORMAT.format(new Date(startsAt))} (hora de Madrid). Da códigos que caducan en pocas horas.`,
      pushNotification: minutesLeft > LIVESTREAM_PUSH_LEAD_MINUTES ? null : {
        title: `Directo de ${version}: queda ${minutesLeft >= ROUNDED_TO_HALF_HOUR_MIN_MINUTES ? 'media hora' : formatTimeLeft(startsAt - now)}`,
        body: `Empieza a las ${LIVESTREAM_TIME_FORMAT.format(new Date(startsAt))} (hora de Madrid). Da códigos que caducan en pocas horas: estate atento.`,
      },
    }];
  }),
};
