import type { GameId } from '../../models/game-id.type.ts';
import type { GameNotes } from '../../models/game-notes.interface.ts';
import type { GenshinNotesData } from '../../models/genshin-notes-data.interface.ts';
import type { NoteMeter } from '../../models/note-meter.interface.ts';
import { STAMINA_REGEN_SECONDS } from '../../models/stamina-regen-seconds.const.ts';
import { STAR_RAIL_RESERVE_STAMINA_MAX } from '../../models/star-rail-reserve-stamina-max.const.ts';
import type { StarRailNotesData } from '../../models/star-rail-notes-data.interface.ts';
import type { ZenlessNotesData } from '../../models/zenless-notes-data.interface.ts';

/** Traduce el `data` de cada juego al formato común del panel. `now` es cuándo se hizo la consulta. */
export const REALTIME_NOTES_PARSERS: Record<GameId, (data: unknown, now: number) => GameNotes> = {
  gi: (data, now) => parseGenshinNotes(data as GenshinNotesData, now),
  hsr: (data, now) => parseStarRailNotes(data as StarRailNotesData, now),
  zzz: (data, now) => parseZenlessNotes(data as ZenlessNotesData, now),
};

function parseGenshinNotes(data: GenshinNotesData, now: number): GameNotes {
  const expeditions = data.expeditions ?? [];
  return {
    fetchedAt: new Date(now).toISOString(),
    stamina: {
      label: 'Resina original',
      current: data.current_resin ?? 0,
      max: data.max_resin ?? 0,
      fullAt: secondsFromNow(now, data.resin_recovery_time),
      regenSeconds: STAMINA_REGEN_SECONDS.gi,
    },
    meters: withoutEmpty([
      { label: 'Misiones diarias', current: data.finished_task_num ?? 0, max: data.total_task_num ?? 0 },
      {
        label: 'Moneda del reino',
        current: data.current_home_coin ?? 0,
        max: data.max_home_coin ?? 0,
        fullAt: secondsFromNow(now, data.home_coin_recovery_time),
      },
      { label: 'Descuentos de jefes restantes', current: data.remain_resin_discount_num ?? 0, max: data.resin_discount_num_limit ?? 0 },
    ]),
    expeditions: summarizeExpeditions(now, expeditions.map(({ status, remained_time }) => ({ status, seconds: remained_time }))),
  };
}

/** Segundos que manda HoYoLAB (a veces como texto) → fecha. `null` si ya está (0 segundos). */
function secondsFromNow(now: number, seconds: string | number | undefined): string | null {
  const secondsLeft = Number(seconds ?? 0) || 0;
  return secondsLeft > 0 ? new Date(now + secondsLeft * 1000).toISOString() : null;
}

/** Quita los contadores que el juego no tiene (máximo 0): por ejemplo, si aún no has desbloqueado algo. */
function withoutEmpty(meters: NoteMeter[]): NoteMeter[] {
  return meters.filter(meter => meter.max > 0);
}

function summarizeExpeditions(now: number, expeditions: { status?: string; seconds?: string | number }[]): GameNotes['expeditions'] {
  if (!expeditions.length) return null;
  const longestSeconds = Math.max(...expeditions.map(({ seconds }) => Number(seconds ?? 0) || 0));
  return {
    ready: expeditions.filter(({ status }) => status === 'Finished').length,
    total: expeditions.length,
    allReadyAt: secondsFromNow(now, longestSeconds),
  };
}

function parseStarRailNotes(data: StarRailNotesData, now: number): GameNotes {
  const expeditions = data.expeditions ?? [];
  return {
    fetchedAt: new Date(now).toISOString(),
    stamina: {
      label: 'Poder trazacaminos',
      current: data.current_stamina ?? 0,
      max: data.max_stamina ?? 0,
      fullAt: secondsFromNow(now, data.stamina_recover_time),
      regenSeconds: STAMINA_REGEN_SECONDS.hsr,
    },
    meters: withoutEmpty([
      { label: 'Entrenamiento diario', current: data.current_train_score ?? 0, max: data.max_train_score ?? 0 },
      { label: 'Universo simulado (semanal)', current: data.current_rogue_score ?? 0, max: data.max_rogue_score ?? 0 },
      { label: 'Ecos de la guerra restantes', current: data.weekly_cocoon_cnt ?? 0, max: data.weekly_cocoon_limit ?? 0 },
      { label: 'Reserva de poder', current: data.current_reserve_stamina ?? 0, max: STAR_RAIL_RESERVE_STAMINA_MAX },
    ]),
    expeditions: summarizeExpeditions(now, expeditions.map(({ status, remaining_time }) => ({ status, seconds: remaining_time }))),
  };
}

function parseZenlessNotes(data: ZenlessNotesData, now: number): GameNotes {
  return {
    fetchedAt: new Date(now).toISOString(),
    stamina: {
      label: 'Batería',
      current: data.energy?.progress?.current ?? 0,
      max: data.energy?.progress?.max ?? 0,
      fullAt: secondsFromNow(now, data.energy?.restore),
      regenSeconds: STAMINA_REGEN_SECONDS.zzz,
    },
    meters: withoutEmpty([
      { label: 'Actividad diaria', current: data.vitality?.current ?? 0, max: data.vitality?.max ?? 0 },
      { label: 'Encargos de recompensa', current: data.bounty_commission?.num ?? 0, max: data.bounty_commission?.total ?? 0 },
      { label: 'Puntos de investigación', current: data.survey_points?.num ?? 0, max: data.survey_points?.total ?? 0 },
      { label: 'Tareas semanales', current: data.weekly_task?.cur_point ?? 0, max: data.weekly_task?.max_point ?? 0 },
    ]),
    expeditions: null,
  };
}
