FROM php:8.2-apache

# Instalar dependencias del sistema y Node.js
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instalar extensiones PHP necesarias
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql mysqli mbstring exif pcntl bcmath gd

RUN docker-php-ext-enable pdo_mysql
RUN a2enmod rewrite

WORKDIR /var/www/html

# Copiar todo el código fuente
COPY . .

# Instalar dependencias de PHP y compilar el frontend con Node/Vite
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# Configurar permisos de almacenamiento y caché de Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Apuntar el DocumentRoot de Apache a la carpeta public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -s 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -s 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Script de entrada para limpiar caché, migrar y arrancar Apache
RUN echo '#!/bin/bash' > /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan config:clear' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan cache:clear' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan migrate --force' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'exec apache2-foreground' >> /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

CMD ["docker-entrypoint.sh"]