FROM node:20.20.2-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

EXPOSE 4200

CMD ["npm", "run", "v3:local"]
