/** Respuesta de `GET hoyo-codes.seria.moe/codes?game=...`. Solo trae los que da por válidos (`status: "OK"`). */
export interface CodesApiResponse {
  codes?: { code?: string; rewards?: string; status?: string }[];
}
