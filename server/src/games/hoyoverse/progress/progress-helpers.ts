/** Cuánta moneda de tiradas hay en una lista de recompensas del calendario. */
export function currencyInRewards(rewards: { item_id: number | string; num: number }[] | undefined, currencyItemId: number): number {
  return (rewards ?? []).filter(reward => Number(reward.item_id) === currencyItemId).reduce((total, reward) => total + reward.num, 0);
}

/** Si un periodo (segundos Unix; fin `0` = sin fin) está abierto en `now`. */
export function isActiveAt(startSeconds: string | number, endSeconds: string | number, now: number): boolean {
  const end = Number(endSeconds);
  return Number(startSeconds) * 1000 <= now && (!end || end * 1000 > now);
}
