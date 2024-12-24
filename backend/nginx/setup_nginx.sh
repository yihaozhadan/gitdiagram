#!/bin/bash

# Exit on any error
set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Copy Nginx configuration
echo "Copying Nginx configuration..."
cp "$(dirname "$0")/api.conf" /etc/nginx/sites-available/api
ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo "Nginx configuration updated successfully!" 