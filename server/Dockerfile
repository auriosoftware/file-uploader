# Stage 1 - build
FROM node:lts-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2 - production image
FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY config/production.js config/
RUN npm install --production

COPY --from=builder /usr/src/app/dist/src ./dist

RUN mkdir -p data
RUN mkdir -p logs

ENV NODE_ENV=production
EXPOSE 3001

ENTRYPOINT ["node", "dist/app.js"]
