<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Ruta principal (Pública - Apunta a Welcome.jsx con Inertia)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Rutas de Autenticación
|--------------------------------------------------------------------------
*/
Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.submit');

Route::get('/registro', [LoginController::class, 'showRegister'])->name('register');
Route::post('/registro', [LoginController::class, 'register'])->name('register.submit');

Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| Rutas Protegidas según el rol
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Redirección inteligente al iniciar sesión según el rol
    Route::get('/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'editor') {
            return redirect()->route('editor.dashboard');
        }

        return redirect()->route('user.catalogo');
    })->name('dashboard');

    // Panel exclusivo para Administradores
    Route::get('/admin/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role !== 'admin') {
            abort(403, 'No tienes permisos para entrar aquí.');
        }
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    // Panel exclusivo para Editores
    Route::get('/editor/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role !== 'editor') {
            abort(403, 'No tienes permisos para entrar aquí.');
        }
        return Inertia::render('Editor/Dashboard');
    })->name('editor.dashboard');

    // Apartado para Usuarios Registrados
    Route::get('/peliculas-series', function () {
        return Inertia::render('User/Catalogo');
    })->name('user.catalogo');
});