FROM node:18-slim As development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18-slim as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

# Copy shared files
COPY ../../tsconfig.base.json ./tsconfig.base.json
# Then continue copying your a
COPY . .

# Copy build output from development stage
COPY --from=development /app/.next ./.next
COPY --from=development /app/public ./public

# Use next start to serve the production build
CMD ["npx", "next", "start", "-p", "3000"]