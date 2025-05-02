FROM nginx:1.27.0-alpine

EXPOSE 443

RUN apk add openssl

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl && openssl req  -x509 -new -newkey rsa:4096 -nodes -days 3650 \
		-out /etc/nginx/ssl/certificate.pem \
		-keyout /etc/nginx/ssl/key.pem \
		-subj "/C=FR/ST=/L=Paris/O=42/CN=vstineau.42.fr" \
		&& chmod +rwx /etc/nginx/ssl/certificate.pem

CMD ["nginx", "-g", "daemon off;"]
