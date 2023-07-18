FROM node:16.18-bullseye-slim

COPY . /app
WORKDIR /app

RUN npm ci
RUN npx prisma generate

RUN npm run build

EXPOSE 3033

CMD ["npm", "run", "start"]