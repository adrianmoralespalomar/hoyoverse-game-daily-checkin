# Hoyo Games

Check-in diario de HoYoLAB y canje automático de códigos de Genshin, Star Rail y Zenless, con panel web. Corre en Docker en el NAS UGREEN (`\\ChanoNAS\Programas\hoyo-games`, puerto 4330). Ver `README.md`.

## Estructura

- `server/`: Node 24 ejecutando TypeScript directamente (type stripping), sin paso de build.
  - `src/daemon.ts`: API HTTP, panel estático y arranque del planificador (`services/task-scheduler.ts`).
  - `src/games/`: un `GameModule` por juego (`models/game-module.interface.ts`), con capacidades opcionales. Los de HoYoverse salen de `models/hoyoverse-games.const.ts`; las peticiones de canje se copiaron del tráfico real de cada web.
  - `src/services/`: check-in, canje de códigos, notas en tiempo real (resina/energía, con firma DS de `core/dynamic-secret.ts`) y estado de las cookies. Guardan en `data/` (JSON).
- `web/`: Angular 22 (standalone, signals, `httpResource`), una sola página. Sus modelos son espejo de `server/src/models`: si cambias uno, cambia el otro.
- `scripts/deploy-nas.ts`: `npm run deploy` compila el panel y copia el código al NAS.

## Reglas del proyecto

- Nombres de código en inglés; textos para el usuario y clases CSS en español.
- En el servidor, los imports relativos llevan extensión `.ts` y no se puede usar sintaxis no borrable (`enum`, parameter properties, `namespace`).
- Nunca intentar saltar captchas ni verificaciones de HoYoverse: marcar para hacerlo a mano.
- Respetar el ritmo de `models/request-pacing.const.ts` (pausas entre juegos y entre canjes).
- Comprobación: `npm run typecheck` y `npm run build:web`.

## Flujo de trabajo

- Tras cualquier cambio, preguntar "¿Lo despliego en el NAS?" y ejecutar `npm run deploy` solo con confirmación. Si avisa de reconstruir, decir al usuario que lo reconstruya en UGOS.
