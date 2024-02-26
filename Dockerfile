FROM node:18.19.0-alpine3.19

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "v3"]
