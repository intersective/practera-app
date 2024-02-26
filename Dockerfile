FROM node:18.19.0-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY start-server /usr/local/bin

EXPOSE 4200

ENTRYPOINT [ "start-server" ]
