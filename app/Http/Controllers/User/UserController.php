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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class UserController extends Controller
{
    private ?array $vistasCache = null;

    private function idsVistas(): array
    {
        if ($this->vistasCache === null) {
            $this->vistasCache = HistorialVisualizacion::where('usuario_id', Auth::id())
                ->where('vista', true)
                ->pluck('pelicula_id')
                ->toArray();
        }
        return $this->vistasCache;
    }

    private function mapPelicula($pelicula, $favoritoIds, $valoracionesMap)
    {
        $plataformas = $pelicula->plataformas_streaming ?? [];

        return [
            'id' => $pelicula->id,
            'titulo' => $pelicula->titulo,
            'poster' => $pelicula->poster_path ?? null,
            'genero_id' => $pelicula->genero_id,
            'genero' => $pelicula->genero->nombre ?? 'Sin género',
            'anio' => $pelicula->anio,
            'director' => $pelicula->director,
            'elenco' => $pelicula->elenco,
            'duracion_min' => $pelicula->duracion_min,
            'pais' => $pelicula->pais,
            'plataformas' => $plataformas,
            'plataformas_streaming' => $plataformas,
            'sinopsis' => $pelicula->sinopsis,
            'trailer_url' => $pelicula->trailer_url,
            'valoracion_promedio' => round($pelicula->valoraciones_pelicula_avg_puntuacion ?? 0, 1),
            'total_valoraciones' => $pelicula->valoraciones_pelicula_count ?? 0,
            'es_favorito' => in_array($pelicula->id, $favoritoIds),
            'es_vista' => in_array($pelicula->id, $this->idsVistas()),
            'mi_valoracion' => $valoracionesMap[$pelicula->id] ?? null,
            'comentarios' => $pelicula->comentarios
                ->filter(fn ($c) => $c->estado === 'visible')
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

    private function datosValoracionResenas(array $resenaIds): array
    {
        if (empty($resenaIds)) {
            return [[], [], []];
        }

        $stats = DB::table('valoraciones_resenas')
            ->select('resena_id', DB::raw('AVG(puntuacion) as promedio'), DB::raw('COUNT(*) as total'))
            ->whereIn('resena_id', $resenaIds)
            ->groupBy('resena_id')
            ->get()
            ->keyBy('resena_id');

        $mias = DB::table('valoraciones_resenas')
            ->where('usuario_id', Auth::id())
            ->whereIn('resena_id', $resenaIds)
            ->pluck('puntuacion', 'resena_id')
            ->toArray();

        $promedios = [];
        $totales = [];
        foreach ($stats as $id => $fila) {
            $promedios[$id] = round((float) $fila->promedio, 1);
            $totales[$id] = (int) $fila->total;
        }

        return [$promedios, $totales, $mias];
    }

    private function baseQuery()
    {
        return Pelicula::where('activa', true)
            ->where('estado', 'publicada')
            ->with([
                'genero', 
                'comentarios' => function ($query) {
                    $query->where('estado', 'visible');
                }, 
                'comentarios.usuario:id,nombre'
            ])
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

        $queryMejor = $this->baseQuery()->orderByDesc('valoraciones_pelicula_avg_puntuacion');
        $queryNuevas = $this->baseQuery()->latest();

        $generosInteres = Pelicula::whereIn('id', array_merge($favoritoIds, $this->idsVistas()))
            ->pluck('genero_id')
            ->unique()
            ->map(fn ($g) => (int) $g)
            ->all();

        $queryRecomendadas = $this->baseQuery();
        if (!empty($generosInteres)) {
            $queryRecomendadas->orderByRaw('(genero_id IN (' . implode(',', $generosInteres) . ')) DESC');
        }
        $queryRecomendadas->inRandomOrder(Auth::id() . date('Ymd'));

        $mejorValoradas = $queryMejor->limit(30)->get()->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));
        $nuevas = $queryNuevas->limit(30)->get()->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));
        $recomendadas = $queryRecomendadas->limit(30)->get()->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        $resenasColeccion = Resena::where('estado', 'publicada')
            ->where('activa', 1)
            ->with(['pelicula:id,titulo,poster_path', 'editor:id,nombre'])
            ->latest()
            ->limit(6)
            ->get();

        [$promResenas, $totResenas, $miasResenas] = $this->datosValoracionResenas($resenasColeccion->pluck('id')->all());

        $resenasMejorValoradas = $resenasColeccion->map(fn ($r) => [
            'id' => $r->id,
            'titulo' => $r->titulo,
            'contenido' => $r->contenido,
            'calificacion' => $r->calificacion,
            'valoracion_promedio' => $promResenas[$r->id] ?? 0,
            'total_valoraciones' => $totResenas[$r->id] ?? 0,
            'mi_valoracion' => $miasResenas[$r->id] ?? null,
            'pelicula' => $r->pelicula->titulo ?? 'N/A',
            'pelicula_poster' => $r->pelicula->poster_path ?? null,
            'autor' => $r->editor->nombre ?? 'Editor',
            'fecha' => $r->created_at?->format('d/m/Y'),
        ]);

        $generos = Genero::where('activo', true)->get(['id', 'nombre']);

        return Inertia::render('User/Inicio', [
            'auth' => ['user' => Auth::user()],
            'mejorValoradas' => $mejorValoradas,
            'nuevas' => $nuevas,
            'recomendadas' => $recomendadas,
            'resenasMejorValoradas' => $resenasMejorValoradas,
            'generos' => $generos,
            'filtros' => $request->only(['genero_id']),
        ]);
    }

    public function catalogo(Request $request)
    {
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $coleccion = $this->baseQuery()
            ->with('editor:id,nombre')
            ->orderBy('titulo')
            ->get();

        $peliculas = $coleccion->map(function ($p) use ($favoritoIds, $valoracionesMap) {
            $datos = $this->mapPelicula($p, $favoritoIds, $valoracionesMap);
            $datos['autor'] = $p->editor->nombre ?? '';
            return $datos;
        })->values();

        $paises = $coleccion->pluck('pais')
            ->map(fn ($x) => trim((string) $x))
            ->filter()
            ->unique()
            ->sort()
            ->values();

        $plataformas = $coleccion
            ->flatMap(fn ($p) => $p->plataformas_streaming ?? [])
            ->filter()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('User/Catalogo', [
            'auth' => ['user' => Auth::user()],
            'peliculas' => $peliculas,
            'generos' => Genero::where('activo', true)->orderBy('nombre')->get(['id', 'nombre']),
            'paises' => $paises,
            'plataformas' => $plataformas,
            'anioMin' => 1888,
            'anioMax' => (int) date('Y'),
        ]);
    }

    public function peliculas(Request $request)
    {
        return $this->catalogo($request);
    }

    public function favoritos(Request $request)
    {
        $userId = Auth::id();
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $favoritosPeliculas = Pelicula::whereIn('id', $favoritoIds)
            ->with([
                'genero', 
                'comentarios' => function ($q) { $q->where('estado', 'visible'); }, 
                'comentarios.usuario:id,nombre'
            ])
            ->withAvg('valoracionesPelicula', 'puntuacion')
            ->withCount('valoracionesPelicula')
            ->get()
            ->map(fn ($p) => $this->mapPelicula($p, $favoritoIds, $valoracionesMap));

        $guardadasIds = ResenaGuardada::where('usuario_id', $userId)->pluck('resena_id')->toArray();
        [$promResenas, $totResenas, $miasResenas] = $this->datosValoracionResenas($guardadasIds);
        $favoritosResenas = Resena::whereIn('id', $guardadasIds)
            ->with(['pelicula:id,titulo,poster_path', 'editor:id,nombre'])
            ->get()
            ->map(fn ($r) => [
                'valoracion_promedio' => $promResenas[$r->id] ?? 0,
                'total_valoraciones' => $totResenas[$r->id] ?? 0,
                'mi_valoracion' => $miasResenas[$r->id] ?? null,
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

    public function vistas(Request $request)
    {
        $userId = Auth::id();
        [$favoritoIds, $valoracionesMap] = $this->contextoUsuario();

        $vistasMap = HistorialVisualizacion::where('usuario_id', $userId)
            ->where('vista', true)
            ->pluck('visto_en', 'pelicula_id');

        $query = $this->baseQuery()->whereIn('id', $vistasMap->keys());

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

        $peliculas = $query->get()
            ->sortByDesc(fn ($p) => $vistasMap[$p->id] ?? null)
            ->values()
            ->map(function ($p) use ($favoritoIds, $valoracionesMap, $vistasMap) {
                $datos = $this->mapPelicula($p, $favoritoIds, $valoracionesMap);
                $visto = $vistasMap[$p->id] ?? null;
                // Formato limpio Día/Mes/Año
                $datos['fecha_agregado'] = $visto ? Carbon::parse($visto)->format('d/m/Y') : null;
                return $datos;
            });

        if ($request->filled('plataforma')) {
            $plataforma = strtolower($request->plataforma);
            $peliculas = $peliculas->filter(fn ($p) => collect($p['plataformas'])->contains(fn ($pl) => str_contains(strtolower($pl), $plataforma)))->values();
        }

        return Inertia::render('User/Vistas', [
            'auth' => ['user' => Auth::user()],
            'peliculasVistas' => $peliculas,
            'generos' => Genero::where('activo', true)->get(['id', 'nombre']),
            'filtros' => $request->only(['q', 'genero_id', 'anio', 'valoracion_min', 'plataforma']),
        ]);
    }

    public function resenas(Request $request)
    {
        $userId = Auth::id();
        $guardadasIds = ResenaGuardada::where('usuario_id', $userId)->pluck('resena_id')->toArray();

        $query = Resena::where('estado', 'publicada')
            ->where('activa', 1)
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

        $coleccion = $query->latest()->get();
        [$promResenas, $totResenas, $miasResenas] = $this->datosValoracionResenas($coleccion->pluck('id')->all());

        $resenas = $coleccion->map(fn ($r) => [
            'id' => $r->id,
            'valoracion_promedio' => $promResenas[$r->id] ?? 0,
            'total_valoraciones' => $totResenas[$r->id] ?? 0,
            'mi_valoracion' => $miasResenas[$r->id] ?? null,
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
            ->where('estado', 'visible')
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
        
        $comentario->update(['estado' => 'oculto']);

        return redirect()->back()->with('message', 'Comentario ocultado exitosamente.');
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

        $this->guardarPuntuacion('valoraciones_peliculas', 'pelicula_id', $validated['pelicula_id'], $validated['puntuacion']);

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

    public function toggleVista(Request $request)
    {
        $validated = $request->validate(['pelicula_id' => 'required|exists:peliculas,id']);

        $registro = HistorialVisualizacion::where('usuario_id', Auth::id())
            ->where('pelicula_id', $validated['pelicula_id'])
            ->first();

        if ($registro) {
            $nuevaVista = !$registro->vista;
            $registro->update([
                'vista' => $nuevaVista,
                'visto_en' => $nuevaVista ? now() : $registro->visto_en,
            ]);
        } else {
            HistorialVisualizacion::create([
                'usuario_id' => Auth::id(),
                'pelicula_id' => $validated['pelicula_id'],
                'vista' => true,
                'visto_en' => now(),
            ]);
            $nuevaVista = true;
        }

        return redirect()->back()->with('message', $nuevaVista
            ? 'Película marcada como vista.'
            : 'Película quitada de tus vistas.');
    }

    public function valorarResena(Request $request)
    {
        $validated = $request->validate([
            'resena_id' => 'required|exists:resenas,id',
            'puntuacion' => 'required|integer|min:1|max:5',
        ]);

        $this->guardarPuntuacion('valoraciones_resenas', 'resena_id', $validated['resena_id'], $validated['puntuacion']);

        return redirect()->back()->with('message', '¡Gracias por valorar la reseña!');
    }

    public function guardarValoracionResena(Request $request)
    {
        return $this->valorarResena($request);
    }

    public function registrarVisita(Request $request)
    {
        return redirect()->back();
    }

    private function guardarPuntuacion(string $tabla, string $columna, $elementoId, int $puntuacion): void
    {
        $hoy = now()->toDateString();
        $filtro = ['usuario_id' => Auth::id(), $columna => $elementoId];

        if (DB::table($tabla)->where($filtro)->exists()) {
            DB::table($tabla)->where($filtro)->update([
                'puntuacion' => $puntuacion,
                'actualizado' => $hoy,
            ]);
        } else {
            DB::table($tabla)->insert($filtro + [
                'puntuacion' => $puntuacion,
                'creado' => $hoy,
                'actualizado' => $hoy,
            ]);
        }
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