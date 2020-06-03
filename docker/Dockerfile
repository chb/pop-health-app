FROM node:12

WORKDIR /app

COPY package.json      /tmp/package.json
COPY package-lock.json /tmp/package-lock.json

RUN cd /tmp && npm install
RUN mv /tmp/node_modules /app/node_modules

COPY . .

RUN cd /app && npm run build

EXPOSE 3003

CMD ["node", "./server/index.js"]