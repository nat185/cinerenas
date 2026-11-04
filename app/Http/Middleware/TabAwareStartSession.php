<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Session\Session;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sesión independiente por pestaña.
 *
 * Las cookies del navegador se comparten entre pestañas, por eso Laravel normalmente
 * usa UNA sola sesión para todas. Aquí el ID de sesión se calcula a partir de un
 * identificador propio de cada pestaña (guardado en sessionStorage), que viaja en la
 * cabecera X-Tab-Session. Cada pestaña tiene así su propia sesión y su propio login.
 */
class TabAwareStartSession extends StartSession
{
    /** Rutas protegidas: una carga completa de página sin identificador de pestaña pasa por el "arranque". */
    private const RUTAS_PROTEGIDAS = ['user/*', 'admin/*', 'editor/*', 'dashboard', 'profile', 'profile/*'];

    public function handle($request, Closure $next)
    {
        $tabId = $this->tabIdDe($request);
        $request->attributes->set('tab_id', $tabId);

        // Carga completa de una página protegida sin saber de qué pestaña viene:
        // se devuelve una mini página que guarda el id de la pestaña en una cookie de
        // 30 segundos y recarga. Así F5 no cierra la sesión de ESA pestaña.
        if (!$tabId && $this->esCargaCompletaProtegida($request)) {
            return $this->paginaDeArranque();
        }

        $response = parent::handle($request, $next);
        $response->headers->set('X-Tab-Aware', $tabId ? 'tab' : 'none');

        // DIAGNÓSTICO TEMPORAL (borrar cuando se resuelva): storage/logs/laravel.log
        \Illuminate\Support\Facades\Log::info('tabdiag', [
            'm' => $request->method(),
            'p' => $request->path(),
            'tab' => $tabId ? substr($tabId, 0, 8) : null,
            'hdr' => $request->hasHeader('X-Tab-Session'),
            'auth' => \Illuminate\Support\Facades\Auth::check(),
            'status' => $response->getStatusCode(),
            'loc' => $response->headers->get('Location'),
        ]);

        // La cookie de arranque es de un solo uso
        if (isset($_COOKIE['tab_boot']) || $request->cookies->has('tab_boot')) {
            $response->headers->clearCookie('tab_boot', '/');
        }

        return $response;
    }

    public function getSession(Request $request)
    {
        $tabId = $request->attributes->get('tab_id');

        return tap($this->manager->driver(), function ($session) use ($request, $tabId) {
            $session->setId($tabId ? $this->idDeSesion($tabId) : $request->cookies->get($session->getName()));
        });
    }

    /**
     * La cookie XSRF-TOKEN es compartida por todas las pestañas y cada una la va pisando
     * con el token de SU sesión, así que el token que trae una petición puede ser de otra
     * pestaña (de ahí el error 419). Las peticiones de nuestra propia página (traen la
     * cabecera X-Tab-Session, que un sitio externo no puede enviar) usan el token de la
     * sesión de su pestaña.
     */
    protected function startSession(Request $request, $session)
    {
        $session = parent::startSession($request, $session);

        if ($request->attributes->get('tab_id') && $request->hasHeader('X-Tab-Session')) {
            $request->headers->set('X-CSRF-TOKEN', $session->token());
        }

        return $session;
    }

    /**
     * Login/logout regeneran el ID de sesión; antes de guardar se vuelve a fijar el ID
     * de la pestaña para que la siguiente petición encuentre la misma sesión.
     */
    protected function saveSession($request)
    {
        $tabId = $request->attributes->get('tab_id');

        if ($tabId && $request->hasSession()) {
            $request->session()->setId($this->idDeSesion($tabId));
        }

        parent::saveSession($request);
    }

    /** En peticiones de pestaña no se escribe la cookie de sesión (sería compartida por todas). */
    protected function addCookieToResponse(Response $response, Session $session)
    {
        if (request()->attributes->get('tab_id')) {
            return;
        }

        parent::addCookieToResponse($response, $session);
    }

    private function tabIdDe(Request $request): ?string
    {
        // La cookie tab_boot se lee en crudo: el middleware EncryptCookies de Laravel descarta
        // las cookies que no están cifradas, y esta la escribe el navegador (JavaScript).
        $id = $request->header('X-Tab-Session')
            ?: ($request->cookies->get('tab_boot') ?: ($_COOKIE['tab_boot'] ?? null));

        return (is_string($id) && preg_match('/^[A-Za-z0-9_-]{16,64}$/', $id)) ? $id : null;
    }

    private function idDeSesion(string $tabId): string
    {
        // 40 caracteres alfanuméricos, y no se puede adivinar sin la APP_KEY
        return substr(hash_hmac('sha256', $tabId, (string) config('app.key')), 0, 40);
    }

    private function esCargaCompletaProtegida(Request $request): bool
    {
        return $request->isMethod('GET')
            && !$request->header('X-Inertia')
            && !$request->ajax()
            && str_contains((string) $request->header('Accept'), 'text/html')
            && $request->is(...self::RUTAS_PROTEGIDAS);
    }

    private function paginaDeArranque(): Response
    {
        $html = <<<'HTML'
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Cargando…</title></head>
<body style="background:#000;margin:0">
<script>
(function () {
    var id = null;
    try {
        id = sessionStorage.getItem('tabSessionId');
        if (!id) {
            id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
                : 'tab-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
            sessionStorage.setItem('tabSessionId', id);
        }
    } catch (e) {}
    if (!id) { location.replace('/login'); return; }

    // Se pide la misma página identificando la pestaña con la cabecera (sin cookies ni recargas)
    fetch(location.href, {
        headers: { 'X-Tab-Session': id, 'Accept': 'text/html' },
        credentials: 'same-origin',
        cache: 'no-store'
    }).then(function (r) {
        if (r.redirected) { location.replace(r.url); return null; }
        return r.text();
    }).then(function (html) {
        if (html === null) return;
        document.open();
        document.write(html);
        document.close();
    }).catch(function () { location.replace('/login'); });
})();
</script>
</body></html>
HTML;

        return response($html, 200, [
            'X-Tab-Aware' => 'bootstrap',
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }
}