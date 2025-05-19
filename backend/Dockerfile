#BACKEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app
 #package*.json

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install

COPY . /app

#start build dev watch
CMD ["npm", "run", "watch"] 
