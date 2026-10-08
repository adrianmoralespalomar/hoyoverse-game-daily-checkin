FROM node:22-alpine

ENV TZ=Europe/Madrid
RUN apk add --no-cache tzdata

WORKDIR /app
COPY index.js package.json ./
COPY crontab /etc/crontabs/root

# El .env se monta como volumen (no se copia a la imagen)
CMD ["crond", "-f", "-l", "8"]
