FROM node:20-alpine

WORKDIR /emmanuel

COPY . .

RUN npm install

CMD ["npm", "run", "dev"]