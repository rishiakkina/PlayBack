FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]