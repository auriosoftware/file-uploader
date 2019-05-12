# Stage 1 - build
FROM node:lts-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2 - production image
FROM abiosoft/caddy:1.0.0-no-stats

COPY ./Caddyfile /etc/Caddyfile
COPY --from=builder /usr/src/app/build /srv

RUN ls -l /srv

RUN mkdir /logs

EXPOSE 80
