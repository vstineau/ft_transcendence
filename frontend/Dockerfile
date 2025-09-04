FROM node:20-alpine
WORKDIR /usr/share/nginx/html

# Installation des dépendances système
RUN apk add --no-cache nginx openssl curl

RUN mkdir -p /etc/nginx/ssl && openssl req -x509 -new -newkey rsa:4096 -nodes -days 3650 \
 -out /etc/nginx/ssl/certificate.pem \
 -keyout /etc/nginx/ssl/key.pem \
 -subj "/C=FR/ST=/L=Paris/O=42/CN=vwv.42.fr" \
 && chmod +rwx /etc/nginx/ssl/certificate.pem

COPY nginx.conf /etc/nginx/nginx.conf
COPY mimes.types /etc/nginx/mimes.types

# Installation des dépendances Node
COPY package.json package-lock.json ./
RUN npm install

# Copier tous les fichiers du projet
COPY . ./

RUN npm run build

COPY src/public/tailwind.css ./tailwind.css

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
