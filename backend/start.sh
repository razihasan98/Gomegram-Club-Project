#!/bin/bash

# If PORT is set by Render (e.g. 10000), update Apache ports
if [ -n "$PORT" ]; then
    sed -i "s/80/$PORT/g" /etc/apache2/ports.conf
    sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf
fi

# Run Laravel optimizations and migrations
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Run database migrations
php artisan migrate --force || true

# Start Apache in foreground
exec apache2-foreground
