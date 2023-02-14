FROM node:12

WORKDIR /app

COPY ./server/           ./
COPY ./package.json      ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

EXPOSE 80

CMD ["node", "./index.js"]