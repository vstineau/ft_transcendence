#FRONTEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app
 #package*.json

EXPOSE 5000

COPY package.json package-lock.json ./

RUN npm install

COPY . /app

#start build dev watch
CMD ["npm", "run", "watch"] 
