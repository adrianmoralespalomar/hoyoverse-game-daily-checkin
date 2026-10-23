import type { AlertPushNotification } from './alert-push-notification.interface.ts';
import type { AlertSeverity } from './alert-severity.type.ts';
import type { GameId } from './game-id.type.ts';

/** Un aviso que el panel enseña como notificación al abrirlo, mientras se cumpla la condición. */
export interface AppAlert {
  /** Estable entre lecturas: el panel lo usa para no repetir el aviso que ya cerraste. */
  id: string;
  /** Juego del que habla: el panel lo pinta con su color y su logo. */
  gameId: GameId | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  /** Qué se manda al móvil: lo mismo que el aviso si no se pone, otro texto si se pone, y nada si es `null`. */
  pushNotification?: AlertPushNotification | null;
  /** Ancla del panel a la que lleva el aviso, por ejemplo `#gi`. */
  href?: string;
}
