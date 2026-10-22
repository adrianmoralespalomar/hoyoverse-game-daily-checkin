/** Lo que recibe el service worker del panel para enseñar la notificación. */
export interface PushNotificationPayload {
  title: string;
  body: string;
  /** Misma etiqueta, misma notificación: una nueva sustituye a la anterior en vez de apilarse. */
  tag: string;
  /** Dónde se abre el panel al tocarla, relativo a la raíz del panel. */
  url: string;
}
