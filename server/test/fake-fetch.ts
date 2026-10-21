export interface CapturedRequest {
  url: string;
  init: RequestInit;
}

/** `fetch` que no sale a la red: responde siempre `json` y apunta cada petición en `requests`. */
export function createFakeFetch(json: unknown, requests: CapturedRequest[], headers: Record<string, string> = {}): typeof fetch {
  return (async (url: string | URL | Request, init: RequestInit = {}) => {
    requests.push({ url: String(url), init });
    return new Response(JSON.stringify(json), { headers });
  }) as typeof fetch;
}
