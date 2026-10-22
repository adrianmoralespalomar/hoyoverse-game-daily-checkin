import type { VersionF2pTarget } from './version-f2p-target.interface';

/** Cómo se explica de dónde sale la cifra de la hoja. */
export const SHEET_KIND_LABELS: Record<NonNullable<VersionF2pTarget['sheetKind']>, string> = {
  exact: 'de la hoja',
  'sheet-estimate': 'estimación de la hoja: la versión no ha acabado',
  average: 'media de las últimas 6 versiones: la hoja aún no tiene esta',
};
