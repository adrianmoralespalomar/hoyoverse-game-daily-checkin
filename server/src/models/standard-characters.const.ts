import type { GameId } from './game-id.type.ts';

/**
 * 5★ del gachapón estándar (en inglés, como se pide el historial). Si te sale uno en el de personaje, has perdido
 * el 50/50. Se completa solo con los que te hayan salido en el estándar; si HoYoverse añade uno nuevo, va aquí.
 */
export const STANDARD_CHARACTERS: Record<GameId, string[]> = {
  gi: ['Diluc', 'Jean', 'Mona', 'Qiqi', 'Keqing', 'Tighnari', 'Dehya', 'Yumemizuki Mizuki'],
  hsr: ['Himeko', 'Welt', 'Bronya', 'Gepard', 'Clara', 'Yanqing', 'Bailu'],
  zzz: ['Grace', 'Rina', 'Koleda', 'Nekomata', 'Soldier 11', 'Lycaon'],
};
