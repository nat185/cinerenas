<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AdminController;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome');
});

/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren autenticación y validación de sesión única)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'user.session'])->group(function () {

    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'editor') {
            return redirect()->route('editor.dashboard');
        }

        return redirect()->route('user.inicio');
    })->name('dashboard');

    // --- Panel de Administración ---
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/peliculas', [AdminController::class, 'peliculas'])->name('admin.peliculas');
    Route::get('/admin/comentarios', [AdminController::class, 'comentarios'])->name('admin.comentarios');
    Route::get('/admin/usuarios', [AdminController::class, 'usuarios'])->name('admin.usuarios');
    Route::get('/admin/estadisticas', [AdminController::class, 'estadisticas'])->name('admin.estadisticas');
    Route::get('/admin/moderacion', [AdminController::class, 'moderacion'])->name('admin.moderacion');
    Route::get('/admin/configuracion', [AdminController::class, 'configuracion'])->name('admin.configuracion');

    // --- Gestión de Películas ---
    Route::post('/admin/peliculas', [AdminController::class, 'storePelicula'])->name('admin.peliculas.store');
    Route::put('/admin/peliculas/{id}', [AdminController::class, 'updatePelicula'])->name('admin.peliculas.update');
    Route::delete('/admin/peliculas/{id}', [AdminController::class, 'destroyPelicula'])->name('admin.peliculas.destroy');

    // --- Gestión de Géneros (Crear, Editar, Desactivar / Restaurar) ---
    Route::post('/admin/generos', [AdminController::class, 'storeGenero'])->name('admin.generos.store');
    Route::put('/admin/generos/{id}', [AdminController::class, 'updateGenero'])->name('admin.generos.update');
    Route::delete('/admin/generos/{id}', [AdminController::class, 'destroyGenero'])->name('admin.generos.destroy');

    // --- Gestión de Usuarios ---
    Route::post('/admin/usuarios', [AdminController::class, 'storeUser'])->name('admin.usuarios.store');
    Route::put('/admin/usuarios/{user}', [AdminController::class, 'updateUserRole'])->name('admin.usuarios.update');
    Route::patch('/admin/usuarios/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('admin.usuarios.toggleStatus');

    // --- Gestión de Comentarios (Ocultar/Restaurar y Cambiar Estado) ---
    Route::delete('/admin/comentarios/{id}', [AdminController::class, 'destroyComentario'])->name('admin.comentarios.destroy');
    Route::patch('/admin/comentarios/{comentario}/cambiar-estado', [AdminController::class, 'cambiarEstadoComentario'])->name('admin.comentarios.cambiarEstado');

    // --- Reportes de Moderación ---
    Route::post('/admin/moderacion', [AdminController::class, 'storeReporteModeracion'])->name('admin.moderacion.store');
    Route::patch('/admin/moderacion/{reporte}/cambiar-estado', [AdminController::class, 'cambiarEstadoModeracion'])->name('admin.moderacion.cambiarEstado');
    Route::delete('/admin/moderacion/{reporte}', [AdminController::class, 'destroyModeracion'])->name('admin.moderacion.destroy');

    // --- Configuración y Perfil del Admin/Editor ---
    Route::post('/admin/configuracion', [AdminController::class, 'guardarConfiguracion'])->name('admin.configuracion.store');
    Route::post('/admin/configuracion/guardar', [AdminController::class, 'guardarConfiguracion'])->name('admin.configuracion.guardar');
    Route::put('/admin/perfil/{user}', [AdminController::class, 'actualizarPerfilAdmin'])->name('admin.perfil.update');

    // --- Panel de Editor y Usuarios ---
    Route::get('/editor/dashboard', function () {
        $user = Auth::user();
        if ($user->role !== 'editor') {
            abort(403, 'No tienes permisos para entrar aquí.');
        }
        return Inertia::render('Editor/Dashboard');
    })->name('editor.dashboard');

    Route::get('/peliculas-series', function () {
        return Inertia::render('User/Catalogo');
    })->name('user.inicio');
});

require __DIR__.'/auth.php';

