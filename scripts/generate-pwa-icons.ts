import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';

/**
 * Dibuja `web/public/favicon.svg` (fondo, dos anillos con huecos y un punto) en los PNG que pide la app instalable.
 * Se lanza a mano si cambia el icono: `node scripts/generate-pwa-icons.ts`.
 */
const PUBLIC_DIRECTORY = resolve(import.meta.dirname, '../web/public');
const SUPERSAMPLING = 4;
const RING_RADIUS = 19;
const RING_HALF_WIDTH = 2.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const ROUNDED_CORNER_RADIUS = 16;
const BACKGROUND = [0x17, 0x13, 0x2e];
const GOLD = [0xe8, 0xc2, 0x6a];
const BLUE = [0x9d, 0xb0, 0xff];
const ORANGE = [0xff, 0x8a, 0x3d];

type Rgba = [number, number, number, number];

/** Distancia recorrida por el anillo desde su inicio (que gira `rotationDegrees`), en las unidades del SVG de 64. */
function getArcLength(x: number, y: number, rotationDegrees: number): number {
  const angle = Math.atan2(y - 32, x - 32) - rotationDegrees * Math.PI / 180;
  return (((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) * RING_RADIUS;
}

function isInsideRoundedSquare(x: number, y: number): boolean {
  const cornerX = Math.min(Math.max(x, ROUNDED_CORNER_RADIUS), 64 - ROUNDED_CORNER_RADIUS);
  const cornerY = Math.min(Math.max(y, ROUNDED_CORNER_RADIUS), 64 - ROUNDED_CORNER_RADIUS);
  return Math.hypot(x - cornerX, y - cornerY) <= ROUNDED_CORNER_RADIUS;
}

/** Color de un punto del SVG de 64×64, o `null` si es transparente. */
function getColorAt(x: number, y: number, hasRoundedCorners: boolean): number[] | null {
  const distance = Math.hypot(x - 32, y - 32);
  if (distance <= 7) return ORANGE;
  if (Math.abs(distance - RING_RADIUS) <= RING_HALF_WIDTH) {
    if (getArcLength(x, y, 108) % 120 < 40) return BLUE;
    if (getArcLength(x, y, -12) % 120 < 80) return GOLD;
  }
  return !hasRoundedCorners || isInsideRoundedSquare(x, y) ? BACKGROUND : null;
}

function drawIcon(size: number, hasRoundedCorners: boolean): Buffer {
  const rows: Buffer[] = [];
  for (let pixelY = 0; pixelY < size; pixelY++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let pixelX = 0; pixelX < size; pixelX++) {
      const sum = [0, 0, 0, 0] as Rgba;
      for (let subY = 0; subY < SUPERSAMPLING; subY++) {
        for (let subX = 0; subX < SUPERSAMPLING; subX++) {
          const color = getColorAt((pixelX + (subX + 0.5) / SUPERSAMPLING) * 64 / size, (pixelY + (subY + 0.5) / SUPERSAMPLING) * 64 / size, hasRoundedCorners);
          if (color) color.forEach((channel, index) => sum[index] += channel), sum[3] += 255;
        }
      }
      const opaqueSamples = sum[3] / 255;
      const offset = 1 + pixelX * 4;
      for (let channel = 0; channel < 3; channel++) row[offset + channel] = opaqueSamples ? Math.round(sum[channel] / opaqueSamples) : 0;
      row[offset + 3] = Math.round(sum[3] / (SUPERSAMPLING * SUPERSAMPLING));
    }
    rows.push(row);
  }
  return encodePng(size, Buffer.concat(rows));
}

function encodePng(size: number, rawRows: Buffer): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const chunk = (type: string, data: Buffer): Buffer => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, checksum]);
  };
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', deflateSync(rawRows)), chunk('IEND', Buffer.alloc(0))]);
}

writeFileSync(resolve(PUBLIC_DIRECTORY, 'icon-192.png'), drawIcon(192, true));
writeFileSync(resolve(PUBLIC_DIRECTORY, 'icon-512.png'), drawIcon(512, true));
// Maskable y de iOS: sin esquinas, el sistema les pone su forma
writeFileSync(resolve(PUBLIC_DIRECTORY, 'icon-maskable-512.png'), drawIcon(512, false));
writeFileSync(resolve(PUBLIC_DIRECTORY, 'apple-touch-icon.png'), drawIcon(180, false));
console.log('Iconos generados en web/public');
