export interface HoyoverseRequestOptions {
  cookie: string;
  language: string;
  /** Se cambia en los tests para no salir a la red. */
  fetchImpl?: typeof fetch;
}
