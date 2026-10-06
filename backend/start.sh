#!/bin/bash

# If PORT is set by Render (e.g. 10000), update Apache ports
if [ -n "$PORT" ]; then
    sed -i "s/80/$PORT/g" /etc/apache2/ports.conf
    sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf
fi

# Ensure storage directories exist and are writable
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/database
touch /var/www/html/database/database.sqlite 2>/dev/null || true
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Clear cache
php artisan config:clear || true
php artisan cache:clear || true

# Run database migrations and seeders
php artisan migrate --force || true
php artisan db:seed --force || true

# Start Apache in foreground
exec apache2-foreground
