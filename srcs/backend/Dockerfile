#BACKEND DOCKERFILE

FROM debian:bullseye

WORKDIR /app
 #package*.json
COPY package.json package-lock.json ./

RUN npm install

CMD ["npm", "start"]
