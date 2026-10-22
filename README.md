# Hoyo Games

Panel personal para **Genshin Impact**, **Honkai: Star Rail** y **Zenless Zone Zero**. Corre en el NAS (Docker) y lo hace todo solo:

- **Check-in diario de HoYoLAB** a la hora que elijas en el panel (19:00 por defecto). Si el NAS estaba apagado, lo hace al arrancar.
- **Canje automático de códigos**: cada hora consulta [hoyo-codes](https://github.com/seriaati/hoyo-codes) y canjea los nuevos en tu cuenta de Europa, uno a uno.
- **Resina y energía**: cada 20 minutos lee las notas en tiempo real (resina original, poder trazacaminos, batería, diarias, semanales y expediciones) y calcula cuándo se llenan. Solo lee: no toca nada de tu cuenta.
- **Contenido final, versión y banners**: cada 2 horas lee el calendario de HoYoLAB (Abismo, Teatro, Asalto estigio, Memoria del Caos, Ficción Pura, Sombra Apocalíptica, Arbitraje, Defensa de Shiyu, Asalto letal): estrellas, lo que te queda por ganar (aproximado), cuándo se renueva, eventos sin completar y los días que quedan de versión y de banners.
- **Ingresos de la versión**: protogemas, jade estelar o películas ganadas en la versión según el diario de HoYoLAB, por fuente. Lee cada día las hojas F2P de la comunidad (una por juego, públicas) para saber cuántas tiradas da la versión y te dice cuántas te faltan. Desde el panel marcas si tienes la bendición/pase mensual y el pase de batalla (por defecto, solo la bendición de Genshin), porque HoYoLAB no lo dice; también puedes apuntar tú la cifra F2P. El iconito *i* explica de dónde sale cada dato.
- **Historial de tiradas**: pegas el enlace del historial del juego (dura 24 horas) y enseña el pity de cada gachapón, si el próximo va a 50/50 o garantizado, los últimos 5★ y las tiradas de la versión. Mientras el enlace vale, trae las nuevas cada hora.
- **Panel web** (`http://192.168.1.142:4330`): los sellos de hoy, la energía, el calendario del mes de cada juego, los códigos con su estado y el estado de las cookies.

Hace las mismas peticiones que la web oficial cuando pulsas la casilla del día o canjeas un código, con tus cookies de sesión. No usa tu contraseña ni toca el cliente del juego.

```
PC ──npm run deploy──► \\ChanoNAS\Programas\hoyo-games ──► contenedor hoyo-games (puerto 4330)
                                                            ├─ hora elegida → check-in (HoYoLAB)
                                                            ├─ cada hora → códigos (hoyo-codes → web de canje)
                                                            ├─ cada 20 min → resina y energía (Crónica de batalla)
                                                            ├─ cada 2 horas → calendario, contenido final y diario
                                                            └─ panel Angular + API
```

## 1. Sacar las cookies

Hacen falta dos: una de **hoyolab.com** (check-in) y otra de **hoyoverse.com** (canje). Las dos dan acceso a tu cuenta: trátalas como una contraseña.

**Check-in** (`HOYOLAB_COOKIE`):

1. Abre <https://www.hoyolab.com> con la sesión iniciada.
2. `F12` → **Application** → **Cookies** → `https://www.hoyolab.com`.
3. Copia `ltuid_v2` y `ltoken_v2` y monta: `ltuid_v2=123456789; ltoken_v2=v2_XXXX...`

**Canje** (`HOYOVERSE_REDEEM_COOKIE`):

1. Abre la web de canje de cualquier juego con la sesión iniciada (por ejemplo <https://hsr.hoyoverse.com/gift>).
2. `F12` → **Application** → **Cookies** → `https://hsr.hoyoverse.com`.
3. Copia `account_id_v2`, `account_mid_v2` y `cookie_token_v2` y monta: `account_id_v2=123456789; account_mid_v2=xxxx_hy; cookie_token_v2=v2_XXXX...`

**UID** de cada juego (`GI_UID`, `HSR_UID`, `ZZZ_UID`): sale en la propia web de canje junto a tu personaje, o en el perfil del juego.

> Si cierras sesión en HoYoLAB o en HoYoverse, esas cookies dejan de valer. El panel lo avisa en la sección **Control**: copia la nueva, pégala en el `.env` del NAS y reinicia el proyecto en UGOS.

## 2. Instalar en el NAS (UGREEN, Docker)

1. Crea la carpeta `\\ChanoNAS\Programas\hoyo-games`.
2. Copia `.env.example` como `.env` en esa carpeta y rellénalo (cookies, UIDs y, recomendado, `WEB_PASSWORD`).
3. En el PC: `npm run install:all` (la primera vez) y `npm run deploy`.
4. En UGOS: **Docker → Proyectos → Crear**, elige la carpeta `hoyo-games` (detecta `docker-compose.yaml`) y despliega.
5. Abre `http://192.168.1.142:4330`.

Para actualizar el código más adelante basta con `npm run deploy`: el contenedor se reinicia solo. Si cambian las dependencias, el `Dockerfile` o el `docker-compose.yaml` (el comando avisa), hay que **reconstruir**: en UGOS, borrar el proyecto y su imagen y volver a crearlo desde la misma carpeta.

**Desde fuera de casa y como app:** el Tailscale del NAS publica el asistente por HTTPS en el puerto 443. Para entrar aquí también (y poder instalar el panel como app en el móvil, que Chrome solo permite por HTTPS), añade el puerto 8443 al `serve.json` del proyecto `tailscale` (repo `asistente`, `deploy/tailscale/`, y su copia en `\ChanoNASProgramas	ailscale`):

```json
{
  "TCP": {
    "443": { "HTTPS": true },
    "8443": { "HTTPS": true }
  },
  "Web": {
    "${TS_CERT_DOMAIN}:443": { "Handlers": { "/": { "Proxy": "http://127.0.0.1:4321" } } },
    "${TS_CERT_DOMAIN}:8443": { "Handlers": { "/": { "Proxy": "http://127.0.0.1:4330" } } }
  }
}
```

Reinicia el contenedor `tailscale` en UGOS y abre `https://chanonas.<tu-red>.ts.net:8443`: Chrome ofrece "Instalar aplicación". El panel ya trae manifiesto, iconos (`scripts/generate-pwa-icons.ts` los dibuja a partir de `favicon.svg`) y un service worker mínimo. No se usa el 4330 en Tailscale porque Docker ya lo tiene ocupado en el NAS.

## 3. Qué significa cada estado

**Check-in**

| Estado | Qué hacer |
|---|---|
| Hecho | Nada |
| Pide captcha 🧩 | Hazlo a mano ese día desde HoYoLAB (el panel enlaza la página) |
| Cookie caducada 🔑 | Vuelve a copiar `HOYOLAB_COOKIE` |
| Sin cuenta | Quita ese juego de `GAMES` |
| Ha fallado | Error de red o mantenimiento: se reintenta solo cada hora (hasta 3 veces al día) |

**Códigos**

| Estado | Qué significa |
|---|---|
| Canjeado | Recompensa enviada al correo del juego |
| Ya lo tenías | Lo habías canjeado (en ZZZ, también si canjeaste otro de la misma familia) |
| Caducado / No vale en EU | La fuente los comprueba con una cuenta de Asia: algunos no sirven en Europa |
| Canjéalo a mano | HoYoverse pidió verificación. No se intenta saltar: abre la web de canje desde el panel |
| Espera cookie nueva | La cookie de canje caducó. Se reintenta al cambiarla |
| Reintentando | Error de red o espera entre canjes: se reintenta en la siguiente hora (hasta 5 veces) |

**Resina y energía**: si sale "Activa Notas en tiempo real", entra en tu Crónica de batalla en hoyolab.com → ajustes (engranaje) y actívalas para ese juego. Si sale "pide verificación", abre la Crónica en la web, resuelve el captcha y pulsa **Leer ahora** en el panel.

**Diario de ingresos**: necesita las dos cookies del `.env` (Star Rail no lo da solo con la de HoYoLAB).

**Historial de tiradas**: abre el juego en el PC, entra en el historial de tiradas y ejecuta en PowerShell, desde cualquier carpeta (con `gi`, `hsr` o `zzz`):

```powershell
powershell -ExecutionPolicy Bypass -File C:/Users/Adrian/Documents/repos/Personal/hoyoverse-game-daily-checkin/scripts/get-wish-link.ps1 -Game gi
```

Copia el enlace de la caché del juego al portapapeles; pégalo en la sección Tiradas del juego. El enlace solo da acceso al historial, no a la cuenta, y el NAS no lo guarda en disco. Si en el gachapón estándar entra un 5★ nuevo, añádelo a `server/src/models/standard-characters.const.ts` para que el 50/50 se cuente bien.

## Por qué está hecho así (para reducir riesgos)

- **Una sola petición por juego y día** para el check-in, como si pulsaras tú. Solo se reintenta ante fallos de red.
- **Canjes espaciados** 6–9 segundos, como la web oficial exige entre canjes.
- **No intenta saltarse captchas ni verificaciones.** Si aparecen, se detiene y te lo indica.
- **Se detiene si una cookie no vale** y no la vuelve a probar hasta que la cambies.
- **Las cookies solo viven en el `.env` del NAS.** En `data/` solo se guarda una huella para saber si cambiaron.

## Desarrollo

- `npm test`: tests del servidor, sin red.
- `npm run typecheck` y `npm run build:web`: comprobaciones.
- `npm start`: daemon local en `http://127.0.0.1:4330` con el `.env` y `data/` de la raíz del repo.
- `npm start --prefix web`: panel en `http://localhost:4200` con los datos del NAS (o del daemon de `HOYO_GAMES_URL`).
