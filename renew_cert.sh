#!/bin/bash

echo "Renewing certificate..."
RESULT=$(docker compose run --rm certbot renew 2>&1)

if echo "$RESULT" | grep -q "Congratulations, all renewals succeeded"; then
    echo "Certificate renewed successfully."
    echo "Restarting container of nginx..."
    docker compose restart nginx
else
    echo "Certificate renewal failed or not needed. Nginx restart skipped."
    echo "Certbot output:"
    echo "$RESULT"
fi
