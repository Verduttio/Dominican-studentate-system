#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "[$(date -Is)] Renewing certificate..."
RESULT=$(docker compose run --rm certbot renew 2>&1)
echo "$RESULT"

if echo "$RESULT" | grep -q "Congratulations, all renewals succeeded"; then
    echo "Certificate renewed successfully. Restarting nginx..."
    docker compose restart nginx
elif echo "$RESULT" | grep -q "No renewals were attempted"; then
    echo "No renewal needed."
else
    echo "Certificate renewal failed or unknown state. Nginx restart skipped."
    exit 1
fi
