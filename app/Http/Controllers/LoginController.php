<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    // Muestra la vista del Registro con React e Inertia
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register', [
            'status' => session('status'),
        ]);
    }

    // Procesa el formulario de Registro
    public function register(Request $request)
    {
        // 1. Validar las entradas del formulario
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'min:6', 'confirmed'],
        ]);

        // 2. Crear el usuario en la BD con el rol 'usuario'
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'usuario', // Rol que le asignamos según el reporte
        ]);

        // 3. Autenticar inmediatamente al usuario
        Auth::login($user);

        // 4. Redirigir al catálogo de películas y series
        return redirect()->route('user.catalogo');
    }

    // Muestra la vista del Login con React e Inertia
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    // Procesa el inicio de sesión
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->has('remember'))) {
            $request->session()->regenerate();

            /** @var \App\Models\User $user */
            $user = Auth::user();

            // Redirección directa por Rol
            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif ($user->role === 'editor') {
                return redirect()->route('editor.dashboard');
            }

            return redirect()->route('user.catalogo');
        }

        return back()->withErrors([
            'email' => 'Las credenciales no coinciden con nuestros registros.',
        ]);
    }

    // Cierre de Sesión y eliminación automática si es usuario común
    public function logout(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Si el usuario autenticado tiene el rol 'usuario', lo eliminamos de la BD al salir
        if ($user && $user->role === 'usuario') {
            $user->delete();
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}