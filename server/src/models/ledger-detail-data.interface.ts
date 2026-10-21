/**
 * `data` de `month_detail` del diario. Genshin trae `action` ya traducida; Star Rail, `action_name`; ZZZ, solo la
 * clave en `action` (`event_rewards`...). `time` es `YYYY-MM-DD hh:mm:ss` del servidor, o segundos Unix en ZZZ.
 */
export interface LedgerDetailData {
  list?: { action?: string; action_name?: string; time: string; num: number }[];
}
