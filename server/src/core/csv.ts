/** Lee un CSV (comillas dobles y saltos de línea dentro de una celda incluidos) en filas de celdas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let isQuoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (isQuoted) {
      if (char !== '"') cell += char;
      else if (text[index + 1] === '"') cell += text[++index];
      else isQuoted = false;
    } else if (char === '"') isQuoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}
