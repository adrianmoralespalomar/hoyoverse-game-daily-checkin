/** Cómo sacar los nombres y los iconos de los personajes de la Crónica de batalla de un juego. */
export interface CharacterIconSource {
  method: 'get' | 'post';
  endpoint: string;
  /** Dónde está la lista dentro de la respuesta. */
  listKey: string;
  nameKey: string;
  iconKey: string;
}
