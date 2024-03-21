FROM node:18.19.0-alpine3.19

WORKDIR /app

RUN npm install -g @angular/cli@13.3.11

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "run", "v3"]
