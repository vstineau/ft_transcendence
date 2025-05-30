#FRONTEND DOCKERFILE

FROM node:20-alpine

WORKDIR /usr/share/nginx/html

 #package*.json

RUN apk add --no-cache nginx openssl

RUN mkdir -p /etc/nginx/ssl && openssl req  -x509 -new -newkey rsa:4096 -nodes -days 3650 \
		-out /etc/nginx/ssl/certificate.pem \
		-keyout /etc/nginx/ssl/key.pem \
		-subj "/C=FR/ST=/L=Paris/O=42/CN=vwv.42.fr" \
		&& chmod +rwx /etc/nginx/ssl/certificate.pem

COPY nginx.conf /etc/nginx/nginx.conf
COPY mimes.types /etc/nginx/mimes.types

EXPOSE 443

COPY package.json package-lock.json ./

RUN npm install

COPY . ./ 

RUN npm run build
#start build dev watch
#CMD ["npm", "run", "dev"] 
CMD ["nginx", "-g", "daemon off;"]
