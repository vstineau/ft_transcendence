#BACKEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app
 #package*.json

RUN apk add --no-cache curl sqlite

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .

RUN npx typeorm-ts-node-esm migration:run -d /app/app/dataSource.ts

#start build dev watch
CMD ["npm", "run", "watch"] 


