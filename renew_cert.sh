#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "$SCRIPT_DIR"

echo "Renewing certificate..."
RESULT=$(docker compose -f "$SCRIPT_DIR/docker-compose.yml" run --rm certbot renew 2>&1)

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Make sure logs exist
mkdir -p "$SCRIPT_DIR/logs"

LOGFILE="$SCRIPT_DIR/logs/certbot_renew_$TIMESTAMP.log"

echo "$RESULT" > "$LOGFILE"

if echo "$RESULT" | grep -q "Congratulations, all renewals succeeded"; then
    echo "Certificate renewed successfully."
    echo "Restarting container of nginx..."
    docker compose -f "$SCRIPT_DIR/docker-compose.yml" restart nginx
else
    echo "Certificate renewal failed or not needed. Nginx restart skipped."
    echo "Certbot output:"
    echo "$RESULT"
fi
