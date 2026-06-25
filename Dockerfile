FROM node:22-alpine

# Chromium is required by Karma for unit tests inside Docker.
# Alpine packages it as `chromium`; the binary is at /usr/bin/chromium-browser.
RUN apk add --no-cache chromium

ENV CHROME_BIN=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json .npmrc ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "run", "v3:local"]
