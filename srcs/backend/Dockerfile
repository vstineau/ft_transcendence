#BACKEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app
 #package*.json

COPY package*.json ./

RUN npm install

COPY . /app/

CMD ["npm", "run", "start"]
