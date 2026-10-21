/** Páginas del diario: las da de 100 en 100 y se piden con una pausa corta, como al pasar de página en la web. */
export const LEDGER_PACING = {
  pageSize: 100,
  betweenPagesMs: { min: 1_000, max: 2_500 },
  /** Tope por si HoYoLAB devolviera páginas llenas sin fin. */
  maxPages: 20,
} as const;
