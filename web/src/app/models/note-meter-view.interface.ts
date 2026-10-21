/** Un contador tal como se pinta: con su porcentaje y, si se recarga solo, cuándo se llena. */
export interface NoteMeterView {
  label: string;
  current: number;
  max: number;
  percent: number;
  isFull: boolean;
  readyText: string | null;
}
