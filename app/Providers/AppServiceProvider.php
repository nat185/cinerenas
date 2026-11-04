<?php

namespace App\Providers;

use App\Http\Middleware\TabAwareCsrf;
use App\Http\Middleware\TabAwareStartSession;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Sesión independiente por pestaña (sustituye a los middlewares estándar del grupo "web")
        $this->app->bind(StartSession::class, TabAwareStartSession::class);
        $this->app->bind(ValidateCsrfToken::class, TabAwareCsrf::class);
    }

    public function boot(): void
    {
        // Al iniciar sesión (desde cualquier controlador) se registra la pestaña
        Event::listen(Login::class, function (Login $event) {
            $request = request();
            $tabId = $request->attributes->get('tab_id');

            if (!$tabId) {
                return;
            }

            DB::table('user_active_sessions')->updateOrInsert(
                ['tab_session_id' => $tabId],
                [
                    'user_id' => $event->user->getAuthIdentifier(),
                    'ip_address' => $request->ip(),
                    'user_agent' => substr((string) $request->userAgent(), 0, 255),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        });

        // Al cerrar sesión se elimina el registro de ESA pestaña (las demás siguen activas)
        Event::listen(Logout::class, function (Logout $event) {
            $tabId = request()->attributes->get('tab_id');

            if ($tabId) {
                DB::table('user_active_sessions')->where('tab_session_id', $tabId)->delete();
            }
        });
    }
}