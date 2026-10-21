import { serverTimeTextToIso, unixSecondsToIso } from '../../core/game-time.ts';
import { waitRandomly } from '../../core/pacing.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { IncomeEntry } from '../../models/income-entry.interface.ts';
import type { LedgerDetailData } from '../../models/ledger-detail-data.interface.ts';
import { LEDGER_PACING } from '../../models/ledger-pacing.const.ts';
import { LEDGER_RETCODE_MESSAGES } from '../../models/ledger-retcode-messages.const.ts';
import type { RealtimeNotesRequest } from '../../models/realtime-notes-request.interface.ts';
import { ZENLESS_INCOME_SOURCES } from '../../models/zenless-income-sources.const.ts';
import { requestHoyolabData } from './hoyolab-data-request.ts';

/** Todos los ingresos de moneda de tiradas de un mes (`YYYYMM`) del diario. Solo hay los últimos 3 meses. */
export async function fetchLedgerMonth(game: HoyoverseGameConfig, request: RealtimeNotesRequest, month: string): Promise<IncomeEntry[]> {
  const entries: IncomeEntry[] = [];
  for (let page = 1; page <= LEDGER_PACING.maxPages; page++) {
    if (page > 1) await waitRandomly(LEDGER_PACING.betweenPagesMs);
    const url = new URL(`${game.ledger.url}/month_detail`);
    const params = {
      uid: request.uid,
      region: game.region,
      month: game.ledger.monthFormat === 'month' ? String(Number(month.slice(4))) : month,
      type: game.ledger.currencyType,
      current_page: String(page),
      page_size: String(LEDGER_PACING.pageSize),
      lang: request.language,
    };
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const { list = [] } = await requestHoyolabData<LedgerDetailData>(url, { ...request, retcodeMessages: LEDGER_RETCODE_MESSAGES });
    entries.push(...list.map(item => ({
      at: parseLedgerTime(item.time),
      source: item.action_name || ZENLESS_INCOME_SOURCES[item.action ?? ''] || item.action || 'Otros',
      amount: item.num,
    })));
    if (list.length < LEDGER_PACING.pageSize) break;
  }
  return entries;
}

function parseLedgerTime(time: string): string {
  return /^\d+$/.test(time) ? unixSecondsToIso(time) ?? new Date(0).toISOString() : serverTimeTextToIso(time);
}
