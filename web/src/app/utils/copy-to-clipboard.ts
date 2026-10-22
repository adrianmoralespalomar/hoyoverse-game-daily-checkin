/**
 * Copia el texto al portapapeles. `navigator.clipboard` solo existe en páginas seguras (HTTPS o localhost) y el
 * panel se abre por `http://` desde el NAS: ahí se usa el método antiguo con un campo temporal.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Sin permiso: se prueba el método antiguo
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}
