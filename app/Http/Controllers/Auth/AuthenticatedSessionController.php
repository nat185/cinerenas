<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => \Illuminate\Support\Facades\Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse|Response
    {
        $request->authenticate();

        $user = Auth::user();

        // Cuenta desactivada
        if (isset($user->estado) && $user->estado !== 'activo') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();

            return back()->withErrors(['correo' => 'Tu cuenta está inactiva.']);
        }

        // Una sola sesión activa por cuenta (otra pestaña u otro dispositivo)
        $tabId = $request->attributes->get('tab_id');
        $limite = now()->subMinutes(\App\Http\Middleware\CheckUserActiveSession::MINUTOS_INACTIVIDAD);

        // Las sesiones vencidas por inactividad ya no cuentan
        DB::table('user_active_sessions')
            ->where('user_id', $user->id)
            ->where('updated_at', '<', $limite)
            ->delete();

        $otras = DB::table('user_active_sessions')
            ->where('user_id', $user->id)
            ->where('tab_session_id', '!=', (string) $tabId);

        if ($otras->exists()) {
            if (!$request->boolean('force_login')) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Mismo contrato que Login.jsx: session_conflict + conflict_email
                return Inertia::render('Auth/Login', [
                    'canResetPassword' => \Illuminate\Support\Facades\Route::has('password.request'),
                    'status' => session('status'),
                    'session_conflict' => true,
                    'conflict_email' => $request->input('correo'),
                ]);
            }

            // El usuario aceptó: se cierra la otra sesión (su siguiente petición la manda al login)
            $otras->delete();
        }

        // Sin "recordarme": la cookie remember es compartida por todas las pestañas
        // y rompería el aislamiento por pestaña.
        $request->session()->regenerate();

        return redirect()->intended($this->rutaPorRol($user));
    }

    public function destroy(Request $request): RedirectResponse
    {
        // El listener del evento Logout borra el registro de ESTA pestaña
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function rutaPorRol($user): string
    {
        $rol = strtolower((string) ($user->rol ?? 'usuario'));

        return match ($rol) {
            'administrador', 'admin' => route('admin.dashboard', absolute: false),
            'editor' => route('editor.dashboard', absolute: false),
            default => route('user.inicio', absolute: false),
        };
    }
}