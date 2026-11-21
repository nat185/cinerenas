FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring xml bcmath zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && npm ci \
    && npm run build

RUN chmod -R 775 storage bootstrap/cache

CMD sh -c "php artisan storage:link || true && php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"

CMD sh -c "php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"
