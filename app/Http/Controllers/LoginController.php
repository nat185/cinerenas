<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Middleware\CheckUserActiveSession;

class LoginController extends Controller
{
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register', [
            'status' => session('status'),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'correo' => ['required', 'string', 'email', 'max:255', 'unique:usuarios,correo'], // Apuntamos a la tabla 'usuarios', columna 'correo'
            'contrasena' => ['required', 'min:6', 'confirmed'],
        ]);

        $user = User::create([
            'nombre' => $request->nombre,      // Asumiendo que tu columna en BD es 'nombre'
            'correo' => $request->correo,     // Se guarda en la columna 'correo'
            'contrasena' => Hash::make($request->contrasena), // Se guarda en la columna 'contrasena'
            'rol' => 'usuario',
            'estado' => 'activo',            // Ajusta si requieres un valor por defecto
        ]);

        Auth::login($user, false);
        $request->session()->regenerate();
        session(['last_activity_time' => time()]);

        return redirect()->route('user.inicio');
    }

    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function login(Request $request): \Illuminate\Http\RedirectResponse|Response
    {
        // 1. Validamos que el email y password vengan en el request
        $credentials = $request->validate([
            'correo' => ['required', 'email'],
            'contrasena' => ['required'],
        ]);

        // 2. Mapeamos las credenciales del formulario hacia las columnas reales de tu base de datos
        $authCredentials = [
            'correo' => $credentials['correo'],
            'password' => $credentials['contrasena'], // Laravel internamente lee getAuthPassword() que ya apunta a 'contrasena'
        ];

        if (! Auth::attempt($authCredentials, false)) {
            return back()->withErrors([
                'correo' => 'Las credenciales no coinciden con nuestros registros.',
            ]);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // ========================================================
        // VALIDACIÓN DE ESTADO INACTIVO
        // ========================================================
        if (strtolower($user->estado ?? 'activo') === 'inactivo') {
            Auth::logout(); // Cerramos la sesión de inmediato
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'correo' => 'Tu cuenta se encuentra inactiva. Comunícate con el administrador.',
            ]);
        }
        // ========================================================

        // ========================================================
        // UNA SOLA SESIÓN ACTIVA POR CUENTA (otra pestaña u otro dispositivo)
        // ========================================================
        $tabId = (string) $request->attributes->get('tab_id');

        // Las sesiones vencidas por inactividad no cuentan
        DB::table('user_active_sessions')
            ->where('user_id', $user->id)
            ->where('updated_at', '<', now()->subMinutes(CheckUserActiveSession::MINUTOS_INACTIVIDAD))
            ->delete();

        $otras = DB::table('user_active_sessions')
            ->where('user_id', $user->id)
            ->where('tab_session_id', '!=', $tabId);

        if ($otras->exists()) {
            if (! $request->boolean('force_login')) {
                // Se anula este intento y se avisa en el Login
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return Inertia::render('Auth/Login', [
                    'canResetPassword' => Route::has('password.request'),
                    'status' => null,
                    'session_conflict' => true,
                    'conflict_email' => $request->input('correo'),
                ]);
            }

            // El usuario aceptó: se cierra la otra sesión (en su siguiente acción vuelve al login)
            $otras->delete();
        }

        $request->session()->regenerate();

        session(['last_activity_time' => time()]);

        if ($user->rol === 'administrador' || $user->rol === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->rol === 'editor') {
            return redirect()->route('editor.dashboard');
        }

        return redirect()->route('user.inicio');
    }

    public function logout(Request $request)
    {
        $reason = $request->input('reason');

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $mensaje = $reason === 'inactivity'
            ? 'Se cerró tu sesión por inactividad. Vuelve a ingresar.'
            : null;

        return redirect()->route('login')->with('status', $mensaje);
    }
}