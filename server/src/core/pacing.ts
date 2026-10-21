import { setTimeout as sleep } from 'node:timers/promises';

export function waitRandomly({ min, max }: { min: number; max: number }): Promise<void> {
  return sleep(Math.floor(min + Math.random() * (max - min)));
}
