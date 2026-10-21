/** `data` de `getGachaLog`. `time` va en la hora del servidor (`YYYY-MM-DD hh:mm:ss`). */
export interface GachaLogData {
  list?: { id: string; time: string; name: string; rank_type: string }[];
}
