<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;

/**
 * Cada pestaña tiene su propia sesión (y su propio token CSRF), pero la cookie
 * XSRF-TOKEN es compartida por todas. Las peticiones que traen la cabecera
 * X-Tab-Session solo pueden venir de nuestra propia página (un sitio externo no
 * puede enviar cabeceras personalizadas sin permiso CORS), así que se aceptan.
 * Las demás peticiones siguen validando el token CSRF normal.
 */
class TabAwareCsrf extends ValidateCsrfToken
{
    protected function tokensMatch($request)
    {
        if ($request->attributes->get('tab_id') && $request->hasHeader('X-Tab-Session')) {
            return true;
        }

        return parent::tokensMatch($request);
    }
}