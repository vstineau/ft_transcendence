#FRONTEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app
 #package*.json

EXPOSE 3000

COPY . /app/

RUN npm install

CMD ["npm", "run", "start"]
