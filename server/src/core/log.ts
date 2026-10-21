/** Lo que se ve en UGOS → Docker → Registros. */
export function log(level: 'INFO' | 'ERROR', message: string): void {
  (level === 'ERROR' ? console.error : console.log)(`[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`);
}
