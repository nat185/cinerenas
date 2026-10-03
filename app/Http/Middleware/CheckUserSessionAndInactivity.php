<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserSessionAndInactivity
{
    protected int $inactivityLimitSeconds = 15 * 60; // 15 minutos

    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 1. Sesión única por PESTAÑA/DISPOSITIVO — se compara directo contra la BD,
        //    no contra la sesión de PHP (que sería la misma para dos pestañas del navegador).
        $tabId = $request->header('X-Tab-Session');

        // Solo evaluamos cuando la petición trae el header (peticiones de Inertia).
        // Una carga completa de página (F5) no lo manda; se revisa en la siguiente
        // navegación dentro de la app, que sí es una petición de Inertia.
        if ($tabId && $user->active_session_id && $tabId !== $user->active_session_id) {
            $this->forceLogout($request);

            return redirect()->route('login')->with(
                'status',
                'Esta cuenta tiene una sesión activa en otra pestaña o dispositivo. Cierra sesión ahí para continuar aquí.'
            );
        }

        // 2. Inactividad (aplica igual a admin, editor y usuario)
        $lastActivity = session('last_activity_time');
        if ($lastActivity && (time() - $lastActivity) > $this->inactivityLimitSeconds) {
            $this->forceLogout($request);

            return redirect()->route('login')->with(
                'status',
                'Se cerró tu sesión por inactividad. Vuelve a ingresar.'
            );
        }

        session(['last_activity_time' => time()]);

        return $next($request);
    }

    private function forceLogout(Request $request): void
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}