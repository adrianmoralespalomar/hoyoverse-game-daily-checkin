# HoYoLAB check-in automático

Hace cada día el check-in de HoYoLAB en **Genshin Impact**, **Honkai: Star Rail** y **Zenless Zone Zero**.
Es Node.js puro, sin dependencias (requiere Node ≥ 20.6).

Por cada juego hace la misma petición que la web cuando pulsas la casilla del día, con tu cookie de sesión. No usa tu contraseña ni toca el cliente del juego.

## 1. Sacar la cookie

1. Abre <https://www.hoyolab.com> con la sesión iniciada.
2. Pulsa `F12` → pestaña **Application** (o **Aplicación**) → **Cookies** → `https://www.hoyolab.com`.
3. Escribe `v2` en el filtro y copia los valores de `ltuid_v2` y `ltoken_v2`.
4. Monta esta línea, separando con punto y coma:
   ```
   ltuid_v2=123456789; ltoken_v2=v2_XXXXXXXX...
   ```

> ⚠️ Esa cookie da acceso a tu cuenta de HoYoLAB: trátala como una contraseña. No la subas a git ni la compartas.
> Si cierras sesión en HoYoLAB, la cookie deja de valer y tendrás que repetir estos pasos.

## 2. Configurar y probar

```bash
cp .env.example .env      # en Windows: copy .env.example .env
# edita .env y pega la cookie en HOYOLAB_COOKIE
# para la primera prueba, pon START_JITTER_SECONDS=0
npm start
```

Salida esperada:

```
[...] INFO  ✅ Genshin Impact: ok — OK
[...] INFO  ☑️ Honkai: Star Rail: already — Ya te has registrado hoy
[...] INFO  ✅ Zenless Zone Zero: ok — OK
```

| Estado | Significado | Qué hacer |
|---|---|---|
| `ok` | Check-in hecho | Nada |
| `already` | Ya estaba hecho hoy | Nada |
| `captcha` 🧩 | HoYoLAB pide captcha | Hazlo a mano ese día desde la web |
| `bad_cookie` 🔑 | Cookie caducada | Vuelve a copiarla (paso 1) |
| `no_account` | No tienes ese juego en esta cuenta | Quítalo de `GAMES` |
| `error` | Otro fallo | Mira el mensaje; si se repite, avísame |

El código de salida es `0` si todo fue bien y `1` si algo requiere tu atención.

Tests (sin red): `npm test`

## 3. Programarlo

El día de HoYoLAB cambia a medianoche UTC+8: a las **18:00** en Madrid en verano y a las **17:00** en invierno. Programarlo a las **19:00** vale todo el año.

### Opción A — Docker en el NAS (recomendado: funciona aunque el PC esté apagado)

Copia la carpeta al NAS, crea el `.env` y arranca el contenedor:

```bash
docker compose up -d --build
docker logs -f hoyolab-checkin        # ver ejecuciones
```

Para lanzarlo a mano y comprobar que funciona:

```bash
docker exec hoyolab-checkin node --env-file=/app/.env index.js
```

La hora se cambia en `crontab`, reconstruyendo después con `docker compose up -d --build`.

### Opción B — Programador de tareas de Windows

1. *Programador de tareas* → **Crear tarea básica** → Diaria, 19:00.
2. Acción **Iniciar un programa**:
   - Programa: `node`
   - Argumentos: `--env-file=.env index.js`
   - Iniciar en: la ruta de esta carpeta
3. En las propiedades de la tarea, marca **Ejecutar la tarea lo antes posible si no se pudo iniciar a la hora programada**, para que se ejecute al encender el PC si estaba apagado a esa hora.

## Por qué está hecho así (para reducir riesgos)

- **Una sola petición por juego y día**, como si pulsaras tú. Solo se reintenta ante un fallo de red, nunca ante una respuesta de HoYoLAB.
- **No intenta saltarse el captcha.** Si aparece, se detiene y te lo indica.
- **Se detiene si la cookie no vale**, sin probar con los demás juegos.
- **Pausas aleatorias** entre juegos y al arrancar (`START_JITTER_SECONDS`).
- **La cookie solo vive en tu `.env`**, que nunca sale de tu máquina ni pasa por servicios de terceros.
- **Las notificaciones (Telegram/Discord) están pendientes.** Hay un hueco preparado en la función `notify()` de `index.js`.
