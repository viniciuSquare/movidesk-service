FROM node:18-alpine3.17

WORKDIR /usr/app

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# RUN apk update \
#   && apk add openssl1.1-compat

# RUN apk add --update --no-cache openssl1.1-compat

COPY . .

RUN npm i 
RUN npm install -g @nestjs/cli

RUN npx prisma generate
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]