<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Editor\EditorController;
use App\Http\Controllers\User\UserController;

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

        if ($user->rol === 'administrador') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->rol === 'editor') {
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

    // --- Inhabilitar Usuario por Incidencias ---
    Route::post('/admin/moderacion/{userId}/inhabilitar', [AdminController::class, 'inhabilitarUsuarioPorIncidencias'])->name('admin.moderacion.inhabilitarUsuario');

    // =========================================================================
    // --- PANEL DE EDITOR Y SUS APARTADOS (Conectados a EditorController) ---
    // =========================================================================
    Route::prefix('editor')->name('editor.')->group(function () {
        Route::get('/dashboard', [EditorController::class, 'dashboard'])->name('dashboard');
        Route::get('/peliculas', [EditorController::class, 'peliculas'])->name('peliculas');

        // --- Gestión de Películas (Editor) ---
        Route::post('/peliculas', [EditorController::class, 'storePelicula'])->name('peliculas.store');
        Route::put('/peliculas/{id}', [EditorController::class, 'updatePelicula'])->name('peliculas.update');
        Route::delete('/peliculas/{id}', [EditorController::class, 'destroyPelicula'])->name('peliculas.destroy');

        // --- Gestión de Reseñas (Editor) ---
        Route::get('/resenas', [EditorController::class, 'resenas'])->name('resenas');
        Route::post('/resenas', [EditorController::class, 'storeResena'])->name('resenas.store');
        Route::put('/resenas/{id}', [EditorController::class, 'updateResena'])->name('resenas.update');
        Route::delete('/resenas/{id}', [EditorController::class, 'destroyResena'])->name('resenas.destroy');

        Route::get('/comentarios', [EditorController::class, 'comentarios'])->name('comentarios');
        Route::get('/estadisticas', [EditorController::class, 'estadisticas'])->name('estadisticas');

        // --- Perfil del Editor ---
        Route::get('/perfil', [EditorController::class, 'perfil'])->name('perfil');
        Route::put('/perfil', [EditorController::class, 'actualizarPerfil'])->name('perfil.update');
    });

    // =========================================================================
    // --- PANEL DE USUARIO NORMAL Y SUS APARTADOS (Conectados a UserController) ---
    // =========================================================================
    Route::prefix('user')->name('user.')->group(function () {
        Route::get('/inicio', [UserController::class, 'inicio'])->name('inicio');
        Route::get('/catalogo', [UserController::class, 'catalogo'])->name('catalogo');

        // --- Películas, Favoritos e Historial de Vistas ---
        Route::get('/peliculas', [UserController::class, 'peliculas'])->name('peliculas');
        Route::get('/favoritos', [UserController::class, 'favoritos'])->name('favoritos');
        Route::get('/vistas', [UserController::class, 'vistas'])->name('vistas');

        Route::match(['post', 'patch'], '/favoritos/{peliculaId}', [UserController::class, 'toggleFavorito'])->name('favoritos.toggle');
        Route::post('/valoraciones', [UserController::class, 'guardarValoracion'])->name('valoraciones.store');
        Route::delete('/valoraciones/{id}', [UserController::class, 'destroyValoracion'])->name('valoraciones.destroy');
        Route::post('/historial', [UserController::class, 'registrarVisita'])->name('historial.store');

        // --- Reseñas (URL limpia sin el prefijo "mis-") ---
        Route::get('/resenas', [UserController::class, 'resenas'])->name('resenas');
        Route::match(['post', 'patch'], '/resenas/{id}/guardar', [UserController::class, 'toggleGuardarResena'])->name('resenas.guardar');

        // --- Mis Comentarios ---
        Route::get('/mis-comentarios', [UserController::class, 'comentarios'])->name('comentarios');
        Route::post('/comentarios', [UserController::class, 'storeComentario'])->name('comentarios.store');
        Route::put('/comentarios/{id}', [UserController::class, 'updateComentario'])->name('comentarios.update');
        Route::delete('/comentarios/{id}', [UserController::class, 'destroyComentario'])->name('comentarios.destroy');

        // --- Perfil del Usuario ---
        Route::get('/perfil', [UserController::class, 'perfil'])->name('perfil');
        Route::put('/perfil', [UserController::class, 'actualizarPerfil'])->name('perfil.update');
    });
});

require __DIR__ . '/auth.php';
