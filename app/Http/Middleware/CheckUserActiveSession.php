<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Valida que ESTA pestaña tenga una sesión registrada y activa (cualquier rol)
 * y cierra la sesión de la pestaña si pasaron 15 minutos sin actividad.
 */
class CheckUserActiveSession
{
    public const MINUTOS_INACTIVIDAD = 15;

    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $tabId = $request->attributes->get('tab_id');

            $registro = $tabId
                ? DB::table('user_active_sessions')
                    ->where('user_id', Auth::id())
                    ->where('tab_session_id', $tabId)
                    ->first()
                : null;

            $expirada = $registro
                && Carbon::parse($registro->updated_at)->lt(now()->subMinutes(self::MINUTOS_INACTIVIDAD));

            if (!$registro || $expirada) {
                return $this->cerrarSesion($request);
            }

            // Última actividad de esta pestaña
            DB::table('user_active_sessions')->where('id', $registro->id)->update(['updated_at' => now()]);
        }

        return $next($request);
    }

    private function cerrarSesion(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->header('X-Inertia')) {
            return Inertia::location(route('login'));
        }

        if ($request->ajax() || $request->expectsJson()) {
            return response()->json(['expirada' => true], 401);
        }

        return redirect()->route('login');
    }
}