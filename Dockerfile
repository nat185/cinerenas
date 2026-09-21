FROM php:8.2-apache

# Instalar dependencias del sistema y herramientas
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

# Instalar el instalador oficial de extensiones de PHP (garantiza pdo_mysql)
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql mysqli mbstring exif pcntl bcmath gd

# Asegurar que la extensión de pdo_mysql esté activa para Apache
RUN docker-php-ext-enable pdo_mysql

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar el código del proyecto
COPY . .

# Instalar dependencias de PHP sin herramientas de desarrollo
RUN composer install --no-dev --optimize-autoloader

# Instalar dependencias de Node y compilar React (Vite)
RUN npm install && npm run build

# Configurar permisos de almacenamiento y caché de Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Cambiar el document root de Apache a la carpeta public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -s 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -s 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Crear un script de inicio para limpiar caché, ejecutar migraciones y arrancar Apache
RUN echo '#!/bin/bash' > /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan config:clear' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan config:cache' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan route:clear' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'php artisan migrate --force' >> /usr/local/bin/docker-entrypoint.sh \
    && echo 'exec apache2-foreground' >> /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

CMD ["docker-entrypoint.sh"]