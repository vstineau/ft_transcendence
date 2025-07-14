#!/bin/sh

CERT_DIR=/etc/nginx/ssl

if [ ! -f "$CERT_DIR/certificate.pem" ] || [ ! -f "$CERT_DIR/key.pem" ]; then
  echo "Generating SSL certificate..."
  openssl req  -x509 -new -newkey rsa:4096 -nodes -days 3650 \
    -out "$CERT_DIR/certificate.pem" \
    -keyout "$CERT_DIR/key.pem" \
    -subj "/C=FR/ST=/L=Paris/O=42/CN=vwv.42.fr"
  chmod +rwx "$CERT_DIR/certificate.pem" "$CERT_DIR/key.pem"
fi

exec nginx -g "daemon off;"
