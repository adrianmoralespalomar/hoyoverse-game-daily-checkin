import { DEFAULT_INCOME_EXTRAS } from '../models/default-income-extras.const.ts';
import { F2P_ESTIMATE } from '../models/f2p-estimate.const.ts';
import type { F2pSheetVersion } from '../models/f2p-sheet-version.interface.ts';
import { GAME_CALENDAR } from '../models/game-calendar.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameVersion } from '../models/game-version.interface.ts';
import type { IncomeExtras } from '../models/income-extras.interface.ts';
import { MS_PER_DAY } from '../models/ms-per-day.const.ts';
import type { VersionF2pTarget } from '../models/version-f2p-target.interface.ts';

interface VersionF2pTargetInput {
  gameId: GameId;
  version: GameVersion;
  sheetVersions: Record<string, F2pSheetVersion>;
  sheetFetchedAt: string | null;
  sheetError: string | null;
  manualPulls: number | null;
  extras: IncomeExtras;
}

/** Tiradas que se esperan en la versión: las F2P de la hoja (o la media si aún no está) y lo de pago que se tenga. */
export function buildVersionF2pTarget(input: VersionF2pTargetInput): VersionF2pTarget {
  const { gameId, version, sheetVersions, manualPulls, extras } = input;
  const knownVersions = Object.entries(sheetVersions).sort(([a], [b]) => compareVersionNames(a, b));
  const own = sheetVersions[version.name];
  const recentVersions = knownVersions.filter(([, sheetVersion]) => !sheetVersion.isEstimate).slice(-F2P_ESTIMATE.averageVersionsCount);
  const averagePulls = recentVersions.length ? recentVersions.reduce((sum, [, sheetVersion]) => sum + sheetVersion.f2pPulls, 0) / recentVersions.length : null;
  const sheetPulls = own?.f2pPulls ?? averagePulls;
  const versionDays = Math.round((Date.parse(version.endsAt) - Date.parse(version.startsAt)) / MS_PER_DAY);
  const monthlyCardPulls = roundToTenths(versionDays * F2P_ESTIMATE.monthlyCardCurrencyPerDay / GAME_CALENDAR.currencyPerPull);
  const latestBattlePassPulls = [...recentVersions].reverse().find(([, sheetVersion]) => sheetVersion.battlePassPulls)?.[1].battlePassPulls;
  const battlePassPulls = own?.battlePassPulls ?? latestBattlePassPulls ?? F2P_ESTIMATE.battlePassPulls[gameId];
  const basePulls = manualPulls ?? sheetPulls;
  return {
    sheetPulls: sheetPulls === null ? null : roundToTenths(sheetPulls),
    sheetKind: !sheetPulls ? null : !own ? 'average' : own.isEstimate ? 'sheet-estimate' : 'exact',
    manualPulls,
    monthlyCard: { isEnabled: extras.monthlyCard, pulls: monthlyCardPulls },
    battlePass: { isEnabled: extras.battlePass, pulls: battlePassPulls },
    totalPulls: basePulls === null ? null : roundToTenths(basePulls + (extras.monthlyCard ? monthlyCardPulls : 0) + (extras.battlePass ? battlePassPulls : 0)),
    sheetFetchedAt: input.sheetFetchedAt,
    sheetError: input.sheetError,
  };
}

/** Los extras con los valores por defecto del juego para lo que no se haya cambiado. */
export function withDefaultExtras(gameId: GameId, saved: Partial<IncomeExtras> | undefined): IncomeExtras {
  return { ...DEFAULT_INCOME_EXTRAS[gameId], ...saved };
}

function compareVersionNames(a: string, b: string): number {
  const [majorA, minorA] = a.split('.').map(Number);
  const [majorB, minorB] = b.split('.').map(Number);
  return majorA - majorB || minorA - minorB;
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10;
}
