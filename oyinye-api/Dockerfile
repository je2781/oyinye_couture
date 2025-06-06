FROM node:alpine AS development

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:alpine AS production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}
ENV APP_NAME=${APP_NAME}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /app/dist ./dist

CMD ["sh", "-c", "node dist/apps/$APP_NAME/main"]
