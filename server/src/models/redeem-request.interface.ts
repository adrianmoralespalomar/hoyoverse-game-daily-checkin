export interface RedeemRequest {
  code: string;
  uid: string;
  cookie: string;
  deviceUuid: string;
  /** Se cambia en los tests para no salir a la red. */
  fetchImpl?: typeof fetch;
}
