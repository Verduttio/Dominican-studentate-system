#!/bin/sh

# Remove 'http://' from the beginning of SERVER_NAME
SERVER_NAME_CLEAN=$(echo "$SERVER_NAME" | sed 's|^http://||')

# Export variable to `envsubst`
export SERVER_NAME_CLEAN

# Use `envsubst`, to replace variable in template and save output as nginx configuration file
envsubst '${SERVER_NAME_CLEAN}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Run Nginx
exec nginx -g 'daemon off;'