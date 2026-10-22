import type { AlertContext } from './alert-context.interface.ts';
import type { AppAlert } from './app-alert.interface.ts';

/** Una condición que avisa. Se puede apagar desde el panel de control. */
export interface AlertRule {
  id: string;
  label: string;
  description: string;
  evaluate(context: AlertContext): AppAlert[];
}
