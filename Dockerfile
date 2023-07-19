FROM node:16.18-bullseye-slim

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3033

CMD ["npm", "run", "start"]