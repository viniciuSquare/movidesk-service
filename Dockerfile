FROM node:16.18-bullseye-slim

COPY ./source /app
WORKDIR /app

RUN npm ci
RUN npm run build

EXPOSE 3000
EXPOSE 9224

CMD ["npm", "run", "start:debug"]