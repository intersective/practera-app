FROM node:22-alpine

# Chromium is required by Karma for unit tests via `docker exec practera-app npm test`.
RUN apk add --no-cache chromium

ENV CHROME_BIN=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json .npmrc ./

# Only install production + build deps (devDeps like eslint/karma/serverless
# are omitted — install them explicitly when needed for lint or test).
RUN npm ci --omit=dev --no-audit

COPY . .

EXPOSE 4200

CMD ["npm", "run", "v3:local"]
