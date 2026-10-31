<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Ejecuta la validación y autenticación de credenciales
        $request->authenticate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // ========================================================
        // VALIDACIÓN DE ESTADO INACTIVO
        // ========================================================
        if ($user && strtolower($user->estado ?? 'activo') === 'inactivo') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'correo' => 'Tu cuenta se encuentra inactiva. Comunícate con el administrador.',
            ]);
        }
        // ========================================================

        $request->session()->regenerate();

        // ========================================================
        // CONTROL DE SESIÓN ÚNICA (Evitar sesiones concurrentes)
        // ========================================================
        $user->active_session_id = session()->getId();
        $user->save();
        // ========================================================

        // 2. Redirección basada en roles
        if ($user->rol === 'administrador' || $user->rol === 'admin') {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        if ($user->rol === 'editor') {
            return redirect()->intended(route('editor.dashboard', absolute: false));
        }

        // Para usuarios u otros roles, los mandamos al inicio general
        return redirect()->intended(route('user.inicio', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        // Limpiamos el identificador de sesión activa al cerrar sesión
        if ($user) {
            $user->active_session_id = null;
            $user->save();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}

