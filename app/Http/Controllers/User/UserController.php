<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Pelicula;
use App\Models\Genero;
use App\Models\Comentario;
use App\Models\Favorito;
use App\Models\ValoracionPelicula;
use App\Models\Resena;
use App\Models\ResenaGuardada;
use App\Models\HistorialVisualizacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    // --------- Helper: convierte una Pelicula en el array que esperan las vistas ---------
    private function mapPelicula($pelicula, $favoritoIds, $valoracionesMap)
    {
        return [
            'id' => $pelicula->id,
            'titulo' => $pelicula->titulo,
            'poster' => $pelicula->poster_path ?? null,
            'genero' => $pelicula->genero->nombre ?? 'Sin género',
            'anio' => $pelicula->anio,
            'director' => $pelicula->director,
            'duracion_min' => $pelicula->duracion_min,
            'pais' => $pelicula->pais,
            'plataformas' => $pelicula->plataformas_streaming ?? [],
            'sinopsis' => $pelicula->sinopsis,
            'trailer_url' => $pelicula->trailer_url,
            'valoracion_promedio' => round($pelicula->valoraciones_pelicula_avg_puntuacion ?? 0, 1),
            'total_valoraciones' => $pelicula->valoraciones_pelicula_count ?? 0,
            'es_favorito' => in_array($pelicula->id, $favoritoIds),
            'mi_valoracion' => $valoracionesMap[$pelicula->id] ?? null,
            'comentarios' => $pelicula->comentarios
                ->where('estado', '!=', 'oculto')
                ->sortByDesc('created_at')
                ->take(8)
                ->values()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'texto' => $c->texto,
                    'usuario' => $c->usuario->nombre ?? 'Usuario',
                    'es_mio' => $c->usuario_id === Auth::id(),
                    'fecha' => $c->created_at?->diffForHumans(),
                ]),
        ];
    }

    private function baseQuery()
    {
        return Pelicula::where('activa', true)
            ->where('estado', 'publicada')
            ->with(['genero', 'comentarios.usuario:id,nombre'])
            ->withAvg('valoracionesPelicula', 'puntuacion')
            ->withCount('valoracionesPelicula');
    }

    private function contextoUsuario()
    {
        $userId = Auth::id();
        $favoritoIds = Favorito::where('usuario_id', $userId)->pluck('pelicula_id')->toArray();
        $valoracionesMap = ValoracionPelicula::where('usuario_id', $userId)->pluck('puntuacion', 'pelicula_id')->toArray();
        return [$favoritoIds, $valoracionesMap];
    }

    public function inicio(Request $request)
    {
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $mejorValoradas = $this->baseQuery()->orderByDesc('valoraciones_pelicula_avg_puntuacion')->limit(10)->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        $nuevas = $this->baseQuery()->latest()->limit(10)->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        $generosFavoritos = Pelicula::whereIn('id', $favoritoIds)->pluck('genero_id')->unique();
        $recomendadas = $this->baseQuery()
            ->when($generosFavoritos->isNotEmpty(), fn ($q) => $q->whereIn('genero_id', $generosFavoritos))
            ->inRandomOrder()->limit(10)->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        $generos = Genero::where('activo', true)->get(['id', 'nombre']);

        return Inertia::render('User/Inicio', [
            'auth' => ['user' => Auth::user()],
            'mejorValoradas' => $mejorValoradas,
            'nuevas' => $nuevas,
            'recomendadas' => $recomendadas,
            'generos' => $generos,
        ]);
    }

    public function catalogo(Request $request)
    {
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $query = $this->baseQuery();

        if ($request->filled('q')) {
            $query->where('titulo', 'like', '%' . $request->q . '%');
        }
        if ($request->filled('genero_id')) {
            $query->where('genero_id', $request->genero_id);
        }
        if ($request->filled('anio')) {
            $query->where('anio', $request->anio);
        }
        if ($request->filled('valoracion_min')) {
            $query->having('valoraciones_pelicula_avg_puntuacion', '>=', $request->valoracion_min);
        }

        $peliculas = $query->latest()->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        if ($request->filled('plataforma')) {
            $plataforma = strtolower($request->plataforma);
            $peliculas = $peliculas->filter(fn ($p) => collect($p['plataformas'])->contains(fn ($pl) => str_contains(strtolower($pl), $plataforma)))->values();
        }

        return Inertia::render('User/Catalogo', [
            'auth' => ['user' => Auth::user()],
            'peliculas' => $peliculas,
            'generos' => Genero::where('activo', true)->get(['id', 'nombre']),
            'filtros' => $request->only(['q', 'genero_id', 'anio', 'valoracion_min', 'plataforma']),
        ]);
    }

    // --- NUEVA VISTA: Mis Favoritos (Películas y Reseñas favoritas) ---
    public function favoritos(Request $request)
    {
        $userId = Auth::id();
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $favoritosPeliculas = Pelicula::whereIn('id', $favoritoIds)
            ->with(['genero', 'comentarios.usuario:id,nombre'])
            ->withAvg('valoracionesPelicula', 'puntuacion')
            ->withCount('valoracionesPelicula')
            ->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        $guardadasIds = ResenaGuardada::where('usuario_id', $userId)->pluck('resena_id')->toArray();
        $favoritosResenas = Resena::whereIn('id', $guardadasIds)
            ->with(['pelicula:id,titulo,poster_path', 'editor:id,nombre'])
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'titulo' => $r->titulo,
                'contenido' => $r->contenido,
                'calificacion' => $r->calificacion,
                'pelicula' => $r->pelicula->titulo ?? 'N/A',
                'pelicula_poster' => $r->pelicula->poster_path ?? null,
                'autor' => $r->editor->nombre ?? 'Editor',
                'fecha' => $r->created_at?->format('d/m/Y'),
                'guardada' => true,
            ]);

        return Inertia::render('User/Favoritos', [
            'auth' => ['user' => Auth::user()],
            'favoritosPeliculas' => $favoritosPeliculas,
            'favoritosResenas' => $favoritosResenas,
        ]);
    }

    // --- NUEVA VISTA: Películas Vistas (con sus filtros correspondientes) ---
    public function vistas(Request $request)
    {
        $userId = Auth::id();
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $peliculaIdsVistas = HistorialVisualizacion::where('usuario_id', $userId)
            ->pluck('pelicula_id')
            ->unique()
            ->toArray();

        $query = Pelicula::whereIn('id', $peliculaIdsVistas)
            ->where('activa', true)
            ->where('estado', 'publicada')
            ->with(['genero', 'comentarios.usuario:id,nombre'])
            ->withAvg('valoracionesPelicula', 'puntuacion')
            ->withCount('valoracionesPelicula');

        if ($request->filled('q')) {
            $query->where('titulo', 'like', '%' . $request->q . '%');
        }
        if ($request->filled('genero_id')) {
            $query->where('genero_id', $request->genero_id);
        }
        if ($request->filled('anio')) {
            $query->where('anio', $request->anio);
        }

        $peliculas = $query->latest()->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        return Inertia::render('User/Vistas', [
            'auth' => ['user' => Auth::user()],
            'peliculas' => $peliculas,
            'generos' => Genero::where('activo', true)->get(['id', 'nombre']),
            'filtros' => $request->only(['q', 'genero_id', 'anio']),
        ]);
    }

    public function peliculas(Request $request)
    {
        $userId = Auth::id();
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $favoritos = Pelicula::whereIn('id', $favoritoIds)
            ->with('genero')->withAvg('valoracionesPelicula', 'puntuacion')->withCount('valoracionesPelicula')
            ->get()->map(fn ($p) => $this->mapPelicula($p->load('comentarios.usuario'), $favoritoIds, $valoracionesMap));

        $historial = HistorialVisualizacion::where('usuario_id', $userId)
            ->with('pelicula:id,titulo')
            ->latest('visto_en')->limit(30)->get()
            ->map(fn ($h) => [
                'id' => $h->id,
                'pelicula' => $h->pelicula->titulo ?? 'Película eliminada',
                'pelicula_id' => $h->pelicula_id,
                'fecha' => $h->visto_en?->format('d/m/Y H:i'),
            ]);

        $misValoraciones = ValoracionPelicula::where('usuario_id', $userId)
            ->with('pelicula:id,titulo')
            ->orderByDesc('id')->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'pelicula' => $v->pelicula->titulo ?? 'Película eliminada',
                'pelicula_id' => $v->pelicula_id,
                'puntuacion' => $v->puntuacion,
                'fecha' => $v->creado ?? null,
            ]);

        return Inertia::render('User/Peliculas', [
            'auth' => ['user' => Auth::user()],
            'favoritos' => $favoritos,
            'historial' => $historial,
            'misValoraciones' => $misValoraciones,
        ]);
    }

    public function resenas(Request $request)
    {
        $userId = Auth::id();
        $guardadasIds = ResenaGuardada::where('usuario_id', $userId)->pluck('resena_id')->toArray();

        $query = Resena::where('estado', 'publicada')
            ->with(['pelicula:id,titulo,poster_path', 'editor:id,nombre']);

        if ($request->filled('pelicula')) {
            $query->whereHas('pelicula', fn ($q) => $q->where('titulo', 'like', '%' . $request->pelicula . '%'));
        }
        if ($request->filled('autor')) {
            $query->whereHas('editor', fn ($q) => $q->where('nombre', 'like', '%' . $request->autor . '%'));
        }
        if ($request->boolean('solo_guardadas')) {
            $query->whereIn('id', $guardadasIds);
        }

        $resenas = $query->latest()->get()->map(fn ($r) => [
            'id' => $r->id,
            'titulo' => $r->titulo,
            'contenido' => $r->contenido,
            'calificacion' => $r->calificacion,
            'pelicula' => $r->pelicula->titulo ?? 'N/A',
            'pelicula_poster' => $r->pelicula->poster_path ?? null,
            'autor' => $r->editor->nombre ?? 'Editor',
            'fecha' => $r->created_at?->format('d/m/Y'),
            'guardada' => in_array($r->id, $guardadasIds),
        ]);

        return Inertia::render('User/Resenas', [
            'auth' => ['user' => Auth::user()],
            'resenas' => $resenas,
            'filtros' => $request->only(['pelicula', 'autor', 'solo_guardadas']),
        ]);
    }

    public function toggleGuardarResena($id)
    {
        $userId = Auth::id();
        $existe = ResenaGuardada::where('usuario_id', $userId)->where('resena_id', $id)->first();

        if ($existe) {
            $existe->delete();
            $mensaje = 'Reseña quitada de guardadas.';
        } else {
            ResenaGuardada::create(['usuario_id' => $userId, 'resena_id' => $id]);
            $mensaje = 'Reseña guardada correctamente.';
        }

        return redirect()->back()->with('message', $mensaje);
    }

    public function comentarios(Request $request)
    {
        $userId = Auth::id();

        $comentarios = Comentario::where('usuario_id', $userId)
            ->with('pelicula:id,titulo')
            ->latest()->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'pelicula' => $c->pelicula->titulo ?? 'Película eliminada',
                'pelicula_id' => $c->pelicula_id,
                'texto' => $c->texto,
                'fecha' => $c->created_at?->format('d/m/Y'),
                'estado' => $c->estado,
            ]);

        $peliculas = Pelicula::where('activa', true)->where('estado', 'publicada')->get(['id', 'titulo']);

        return Inertia::render('User/Comentarios', [
            'auth' => ['user' => Auth::user()],
            'comentarios' => $comentarios,
            'peliculas' => $peliculas,
        ]);
    }

    public function storeComentario(Request $request)
    {
        $validated = $request->validate([
            'pelicula_id' => 'required|exists:peliculas,id',
            'texto' => 'required|string|max:1000',
        ]);

        Comentario::create([
            'usuario_id' => Auth::id(),
            'pelicula_id' => $validated['pelicula_id'],
            'texto' => $validated['texto'],
            'estado' => 'visible',
        ]);

        return redirect()->back()->with('message', 'Tu comentario fue publicado.');
    }

    public function updateComentario(Request $request, $id)
    {
        $comentario = Comentario::findOrFail($id);
        if ($comentario->usuario_id !== Auth::id()) {
            abort(403, 'No puedes editar un comentario que no es tuyo.');
        }

        $validated = $request->validate(['texto' => 'required|string|max:1000']);
        $comentario->update(['texto' => $validated['texto']]);

        return redirect()->back()->with('message', 'Comentario actualizado.');
    }

    public function destroyComentario($id)
    {
        $comentario = Comentario::findOrFail($id);
        if ($comentario->usuario_id !== Auth::id()) {
            abort(403, 'No puedes eliminar un comentario que no es tuyo.');
        }
        $comentario->delete();

        return redirect()->back()->with('message', 'Comentario eliminado.');
    }

    public function toggleFavorito($peliculaId)
    {
        $userId = Auth::id();
        $existe = Favorito::where('usuario_id', $userId)->where('pelicula_id', $peliculaId)->first();

        if ($existe) {
            $existe->delete();
            $mensaje = 'Se quitó de tus favoritos.';
        } else {
            Favorito::create(['usuario_id' => $userId, 'pelicula_id' => $peliculaId]);
            $mensaje = 'Se agregó a tus favoritos.';
        }

        return redirect()->back()->with('message', $mensaje);
    }

    public function guardarValoracion(Request $request)
    {
        $validated = $request->validate([
            'pelicula_id' => 'required|exists:peliculas,id',
            'puntuacion' => 'required|integer|min:1|max:5',
        ]);

        ValoracionPelicula::updateOrCreate(
            ['usuario_id' => Auth::id(), 'pelicula_id' => $validated['pelicula_id']],
            [
                'puntuacion' => $validated['puntuacion'],
                'actualizado' => now()->toDateString(),
                'creado' => now()->toDateString(),
            ]
        );

        return redirect()->back()->with('message', '¡Gracias por tu valoración!');
    }

    public function destroyValoracion($id)
    {
        $valoracion = ValoracionPelicula::findOrFail($id);
        if ($valoracion->usuario_id !== Auth::id()) {
            abort(403);
        }
        $valoracion->delete();

        return redirect()->back()->with('message', 'Valoración eliminada.');
    }

    public function registrarVisita(Request $request)
    {
        $validated = $request->validate(['pelicula_id' => 'required|exists:peliculas,id']);

        HistorialVisualizacion::create([
            'usuario_id' => Auth::id(),
            'pelicula_id' => $validated['pelicula_id'],
            'visto_en' => now(),
        ]);

        return response()->noContent();
    }

    public function perfil(Request $request)
    {
        return Inertia::render('User/Perfil', [
            'auth' => ['user' => Auth::user()],
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        $user = User::findOrFail(Auth::id());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,correo,' . $user->id,
            'current_password' => 'nullable|required_with:password|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->nombre = $validated['name'];
        $user->correo = $validated['email'];

        if (!empty($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->contrasena)) {
                return redirect()->back()->withErrors(['current_password' => 'La contraseña actual es incorrecta.']);
            }
            $user->contrasena = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->back()->with('message', 'Tu perfil ha sido actualizado.');
    }
}