# Imagen con Node y las dependencias del servidor. El código (server/src y web/dist) no va dentro: se monta desde
# la carpeta del NAS, así que para actualizar basta con `npm run deploy` desde el PC, sin reconstruir la imagen.
# Solo hay que reconstruir si cambian las dependencias (server/package-lock.json) o este fichero.

FROM node:24-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json server/
RUN npm ci --omit=dev --prefix server
ENV HOST=0.0.0.0
EXPOSE 4330
# --watch reinicia el daemon cuando `npm run deploy` copia código nuevo
CMD ["node", "--watch", "server/src/daemon.ts"]
