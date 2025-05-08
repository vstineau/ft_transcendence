#BACKEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app
 #package*.json

COPY package*.json ./

RUN npm install

COPY . /app/

RUN npm run build

CMD ["npm", "run", "start"]
