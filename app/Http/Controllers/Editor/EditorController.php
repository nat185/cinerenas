<?php

namespace App\Http\Controllers\Editor;

use App\Http\Controllers\Controller;
use App\Models\Pelicula;
use App\Models\Genero;
use App\Models\Resena;
use App\Models\Comentario;
use App\Models\ReporteModeracion;
use App\Models\User;
use App\Models\ValoracionResena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Inertia\Inertia;

class EditorController extends Controller
{
    /**
     * Plataformas de streaming permitidas. Debe coincidir con el SET de la
     * columna peliculas.plataformas_streaming y con las casillas de la pantalla.
     */
    private const PLATAFORMAS = [
        'Netflix', 'Max', 'Disney+', 'Amazon Prime Video',
        'Apple TV+', 'Paramount+', 'MUBI', 'Claro Video',
        'Pluto TV', 'Tubi', 'Plex', 'Mercado Play',
    ];

    /**
     * Acepta un arreglo o un texto separado por comas y devuelve un arreglo limpio.
     */
    private function normalizarPlataformas($valor): array
    {
        if ($valor === null || $valor === '') {
            return [];
        }

        $lista = is_array($valor) ? $valor : explode(',', (string) $valor);
        $lista = array_map(fn ($v) => trim((string) $v), $lista);

        return array_values(array_unique(array_filter($lista, fn ($v) => $v !== '')));
    }

    private function checkEditor()
    {
        if (Auth::user()->rol !== 'editor') {
            abort(403, 'No tienes permisos para entrar aquí.');
        }
    }

    public function dashboard(Request $request)
    {
        $this->checkEditor();
        $editorId = Auth::id();

        // 1. Películas publicadas y activas en el sistema
        $peliculasPublicadas = Pelicula::where('estado', 'publicada')
            ->where('activa', 1)
            ->count();

        // 2. Reseñas creadas y publicadas por el editor
        $resenasCreadas = Resena::where('editor_id', $editorId)
            ->where('activa', 1)
            ->where('estado', 'publicada')
            ->count();

        // 3. Comentarios recibidos en las películas propias del editor
        $comentariosRecibidos = 0;
        try {
            $comentariosRecibidos = Comentario::whereHas('pelicula', function ($query) use ($editorId) {
                $query->where('editor_id', $editorId)->where('activa', 1);
            })->count();
        } catch (\Throwable $e) {
            $comentariosRecibidos = 0;
        }

        // 4. Valoración Promedio real otorgada por el público a las reseñas publicadas del editor
        $valoracionPromedio = 0;
        try {
            $valoracionPromedio = ValoracionResena::whereHas('resena', function ($query) use ($editorId) {
                $query->where('editor_id', $editorId)
                    ->where('activa', 1)
                    ->where('estado', 'publicada');
            })->avg('puntuacion') ?? 0;
        } catch (\Throwable $e) {
            $valoracionPromedio = 0;
        }

        $stats = [
            'peliculasPublicadas' => $peliculasPublicadas,
            'resenasCreadas'      => $resenasCreadas,
            'comentariosRecibidos' => $comentariosRecibidos,
            'valoracionPromedio'  => round($valoracionPromedio, 1),
        ];

        // 5. Últimas películas agregadas recientemente en el sistema
        $ultimasPeliculas = Pelicula::where('activa', 1)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'titulo' => $p->titulo,
                'poster' => $p->poster_path ?? '/dist/assets/img/posters/default.jpg',
            ]);

        // 6. Reseñas Pendientes (Borradores propios + Películas publicadas sin reseña activa/publicada)
        $borradoresCount = Resena::where('editor_id', $editorId)
            ->where('estado', 'borrador')
            ->count();

        // Películas publicadas que no tienen ninguna reseña o cuya reseña está archivada
        $peliculasSinResenaCount = Pelicula::where('estado', 'publicada')
            ->where('activa', 1)
            ->where(function ($query) {
                $query->whereDoesntHave('resenas')
                      ->orWhereHas('resenas', function ($q) {
                          $q->where('estado', 'archivada');
                      });
            })
            ->count();

        $resenasPendientes = $borradoresCount + $peliculasSinResenaCount;

        return Inertia::render('Editor/Dashboard', [
            'auth'               => ['user' => Auth::user()],
            'stats'              => $stats,
            'ultimasPeliculas'   => $ultimasPeliculas,
            'resenasPendientes'  => $resenasPendientes,
            'desglosePendientes' => [
                'borradores' => $borradoresCount,
                'sinResena'  => $peliculasSinResenaCount,
            ],
        ]);
    }

    public function peliculas(Request $request)
    {
        $this->checkEditor();

        $peliculas = Pelicula::with(['genero', 'editor'])->latest()->get();

        return Inertia::render('Editor/Peliculas', [
            'auth' => ['user' => Auth::user()],
            'peliculas' => $peliculas,
            'generos' => Schema::hasTable('generos') ? Genero::where('activo', 1)->get() : [],
            'plataformasDisponibles' => self::PLATAFORMAS,
        ]);
    }

    public function storePelicula(Request $request)
    {
        $this->checkEditor();

        $request->merge(['plataformas' => $this->normalizarPlataformas($request->input('plataformas'))]);

        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'anio' => 'nullable|integer|min:1888|max:' . date('Y'),
            'director' => 'nullable|string|max:120',
            'elenco' => 'nullable|string',
            'duracion_min' => 'nullable|integer|min:1|max:500',
            'pais' => 'nullable|string|max:80',
            'plataformas' => 'nullable|array',
            'plataformas.*' => ['string', Rule::in(self::PLATAFORMAS)],
            'sinopsis' => 'nullable|string',
            'trailer_url' => 'nullable|string|max:255',
            'estado' => 'required|in:borrador,publicada',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'titulo.required' => 'El título de la película es obligatorio.',
            'plataformas.*.in' => 'Selecciona únicamente plataformas de la lista disponible.',
            'anio.min' => 'El año de la película debe ser válido (mínimo 1888).',
            'anio.max' => 'El año no puede ser superior al actual (' . date('Y') . ').',
            'duracion_min.min' => 'La duración debe ser un número positivo mayor a 0.',
        ]);

        // Validación insensible a mayúsculas, minúsculas y espacios duplicados
        $tituloLimpio = strtolower(preg_replace('/\s+/', ' ', trim($validated['titulo'])));
        $existeTitulo = Pelicula::whereRaw("LOWER(REGEXP_REPLACE(titulo, '[[:space:]]+', ' ')) = ?", [$tituloLimpio])->exists();

        if ($existeTitulo) {
            return redirect()->back()->withErrors(['titulo' => 'Ya existe una película registrada con este título (sin importar mayúsculas, minúsculas o espacios).'])->withInput();
        }

        $posterPath = null;
        if ($request->hasFile('poster')) {
            $posterPath = '/storage/' . $request->file('poster')->store('posters', 'public');
        }

        $plataformasArray = $validated['plataformas'] ?? [];

        Pelicula::create([
            'titulo' => trim($validated['titulo']),
            'genero_id' => $validated['genero_id'],
            'editor_id' => Auth::id(),
            'anio' => $validated['anio'] ?? null,
            'director' => $validated['director'] ?? null,
            'elenco' => $validated['elenco'] ?? null,
            'duracion_min' => $validated['duracion_min'] ?? null,
            'pais' => $validated['pais'] ?? null,
            'plataformas_streaming' => $plataformasArray,
            'sinopsis' => $validated['sinopsis'] ?? null,
            'trailer_url' => $validated['trailer_url'] ?? null,
            'estado' => $validated['estado'],
            'activa' => $validated['estado'] === 'publicada' ? 1 : 0,
            'poster_path' => $posterPath,
        ]);

        return redirect()->back()->with('message', 'Película registrada correctamente.');
    }

    public function updatePelicula(Request $request, $id)
    {
        $this->checkEditor();

        $pelicula = Pelicula::findOrFail($id);

        $request->merge(['plataformas' => $this->normalizarPlataformas($request->input('plataformas'))]);

        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'anio' => 'nullable|integer|min:1888|max:' . date('Y'),
            'director' => 'nullable|string|max:120',
            'elenco' => 'nullable|string',
            'duracion_min' => 'nullable|integer|min:1|max:500',
            'pais' => 'nullable|string|max:80',
            'plataformas' => 'nullable|array',
            'plataformas.*' => ['string', Rule::in(self::PLATAFORMAS)],
            'sinopsis' => 'nullable|string',
            'trailer_url' => 'nullable|string|max:255',
            'estado' => 'required|in:borrador,publicada,archivada',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'titulo.required' => 'El título de la película es obligatorio.',
            'plataformas.*.in' => 'Selecciona únicamente plataformas de la lista disponible.',
            'anio.min' => 'El año debe ser un número válido (mínimo 1888).',
            'anio.max' => 'El año no puede ser superior a ' . date('Y') . '.',
        ]);

        // Validación insensible a mayúsculas, minúsculas y espacios, excluyendo la película actual
        $tituloLimpio = strtolower(preg_replace('/\s+/', ' ', trim($validated['titulo'])));
        $existeTitulo = Pelicula::whereRaw("LOWER(REGEXP_REPLACE(titulo, '[[:space:]]+', ' ')) = ?", [$tituloLimpio])
            ->where('id', '!=', $id)
            ->exists();

        if ($existeTitulo) {
            return redirect()->back()->withErrors(['titulo' => 'Ya existe otra película registrada con este título.'])->withInput();
        }

        if ($request->hasFile('poster')) {
            if ($pelicula->poster_path) {
                $oldPath = str_replace('/storage/', '', $pelicula->poster_path);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $pelicula->poster_path = '/storage/' . $request->file('poster')->store('posters', 'public');
        }

        $activa = ($validated['estado'] === 'archivada') ? 0 : 1;

        $plataformasArray = $validated['plataformas'] ?? [];

        $pelicula->update([
            'titulo' => trim($validated['titulo']),
            'genero_id' => $validated['genero_id'],
            'anio' => $validated['anio'] ?? null,
            'director' => $validated['director'] ?? null,
            'elenco' => $validated['elenco'] ?? null,
            'duracion_min' => $validated['duracion_min'] ?? null,
            'pais' => $validated['pais'] ?? null,
            'plataformas_streaming' => $plataformasArray,
            'sinopsis' => $validated['sinopsis'] ?? null,
            'trailer_url' => $validated['trailer_url'] ?? null,
            'estado' => $validated['estado'],
            'activa' => $activa,
            'poster_path' => $pelicula->poster_path,
        ]);

        return redirect()->back()->with('message', 'Película actualizada con éxito en la base de datos.');
    }

    public function destroyPelicula($id)
    {
        $this->checkEditor();

        $pelicula = Pelicula::findOrFail($id);
        
        $estaInactiva = ($pelicula->activa == 0 || strtolower($pelicula->estado) === 'archivada');

        if ($estaInactiva) {
            $pelicula->update([
                'activa' => 1, 
                'estado' => 'publicada'
            ]);
            $mensaje = 'La película ha sido reactivada y publicada correctamente.';
        } else {
            $pelicula->update([
                'activa' => 0, 
                'estado' => 'archivada'
            ]);
            $mensaje = 'La película ha sido archivada e inhabilitada correctamente.';
        }

        return redirect()->back()->with('message', $mensaje);
    }

    public function resenas(Request $request)
    {
        $this->checkEditor();

        return Inertia::render('Editor/Resenas', [
            'auth' => ['user' => Auth::user()],
            'resenas' => Resena::where('editor_id', Auth::id())->with('pelicula:id,titulo')->latest()->get(),
            'peliculas' => Pelicula::where('activa', 1)->get(['id', 'titulo', 'estado', 'activa']),
        ]);
    }

    public function storeResena(Request $request)
    {
        $this->checkEditor();

        $validated = $request->validate([
            'pelicula_id' => 'required|exists:peliculas,id',
            'titulo' => 'required|string|max:150',
            'contenido' => 'required|string',
            'calificacion' => 'required|numeric|min:0|max:5',
            'estado' => 'required|in:borrador,publicada,archivada',
        ]);

        Resena::create([
            'pelicula_id' => $validated['pelicula_id'],
            'editor_id' => Auth::id(),
            'titulo' => $validated['titulo'],
            'contenido' => $validated['contenido'],
            'calificacion' => $validated['calificacion'],
            'estado' => $validated['estado'],
            'activa' => $validated['estado'] !== 'archivada' ? 1 : 0,
        ]);

        return redirect()->back()->with('message', 'Reseña registrada correctamente.');
    }

    public function updateResena(Request $request, $id)
    {
        $this->checkEditor();

        $resena = Resena::findOrFail($id);
        if ($resena->editor_id !== Auth::id()) {
            abort(403, 'No puedes editar una reseña que no te pertenece.');
        }

        $validated = $request->validate([
            'pelicula_id' => 'required|exists:peliculas,id',
            'titulo' => 'required|string|max:150',
            'contenido' => 'required|string',
            'calificacion' => 'required|numeric|min:0|max:5',
            'estado' => 'required|in:borrador,publicada,archivada',
        ]);

        $resena->update([
            'pelicula_id' => $validated['pelicula_id'],
            'titulo' => $validated['titulo'],
            'contenido' => $validated['contenido'],
            'calificacion' => $validated['calificacion'],
            'estado' => $validated['estado'],
            'activa' => $validated['estado'] !== 'archivada' ? 1 : 0,
        ]);

        return redirect()->back()->with('message', 'Reseña actualizada con éxito.');
    }

    public function destroyResena($id)
    {
        $this->checkEditor();

        $resena = Resena::findOrFail($id);
        if ($resena->editor_id !== Auth::id()) {
            abort(403, 'No puedes modificar una reseña que no te pertenece.');
        }

        $estaArchivada = strtolower($resena->estado) === 'archivada';

        if ($estaArchivada) {
            $resena->update(['estado' => 'publicada', 'activa' => 1]);
            $mensaje = 'La reseña ha sido restaurada.';
        } else {
            $resena->update(['estado' => 'archivada', 'activa' => 0]);
            $mensaje = 'La reseña ha sido archivada.';
        }

        return redirect()->back()->with('message', $mensaje);
    }

    public function comentarios(Request $request)
    {
        $this->checkEditor();
        $editorId = Auth::id();

        $comentarios = [];
        try {
            $comentarios = Comentario::with(['usuario:id,nombre', 'pelicula:id,titulo'])
                ->whereHas('pelicula', function ($query) use ($editorId) {
                    $query->where('editor_id', $editorId);
                })
                ->latest()
                ->get();

            $reportes = ReporteModeracion::where('reportado_por_id', $editorId)->get();

            $comentarios->transform(function ($c) use ($reportes) {
                $reporte = $reportes->firstWhere('comentario_id', $c->id);
                $c->estado = $reporte ? $reporte->estado : 'sin_reporte';
                $c->motivo_reporte = $reporte ? $reporte->motivo : null;
                return $c;
            });
        } catch (\Throwable $e) {
            $comentarios = [];
        }

        return Inertia::render('Editor/Comentarios', [
            'auth' => ['user' => Auth::user()],
            'comentarios' => $comentarios,
        ]);
    }

    public function reportarComentario(Request $request, $id)
    {
        $this->checkEditor();

        $validated = $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        ReporteModeracion::updateOrCreate(
            [
                'comentario_id' => $id,
                'reportado_por_id' => Auth::id(),
            ],
            [
                'motivo' => $validated['motivo'],
                'estado' => 'pendiente',
            ]
        );

        return redirect()->back()->with('message', 'El comentario fue reportado a moderación correctamente.');
    }

    public function estadisticas(Request $request)
    {
        $this->checkEditor();

        $editorId = Auth::id();

        $resenasPorSemana = collect([3, 2, 1, 0])->map(function ($weeksAgo) use ($editorId) {
            $start = Carbon::now()->subWeeks($weeksAgo)->startOfWeek()->toDateString();
            $end = Carbon::now()->subWeeks($weeksAgo)->endOfWeek()->toDateString();

            $count = 0;
            try {
                $count = Resena::where('editor_id', $editorId)
                    ->where('activa', 1)
                    ->where('estado', 'publicada')
                    ->whereBetween('creado', [$start, $end])
                    ->count();
            } catch (\Throwable $e) {
                $count = 0;
            }

            return [
                'label' => 'S' . (4 - $weeksAgo),
                'value' => $count,
            ];
        })->toArray();

        $comentariosPorSemana = collect([3, 2, 1, 0])->map(function ($weeksAgo) use ($editorId) {
            $start = Carbon::now()->subWeeks($weeksAgo)->startOfWeek()->toDateString();
            $end = Carbon::now()->subWeeks($weeksAgo)->endOfWeek()->toDateString();

            $count = 0;
            try {
                $count = Comentario::whereHas('pelicula', function ($query) use ($editorId) {
                    $query->where('editor_id', $editorId)->where('activa', 1);
                })->whereBetween('creado', [$start, $end])->count();
            } catch (\Throwable $e) {
                $count = 0;
            }

            return [
                'label' => 'S' . (4 - $weeksAgo),
                'value' => $count,
            ];
        })->toArray();

        $promedioValoracionesResenas = 0;
        try {
            $promedioValoracionesResenas = ValoracionResena::whereHas('resena', function ($query) use ($editorId) {
                $query->where('editor_id', $editorId)->where('activa', 1)->where('estado', 'publicada');
            })->avg('puntuacion') ?? 0;
        } catch (\Throwable $e) {
            $promedioValoracionesResenas = 0;
        }

        $misPeliculas = [
            'total' => Pelicula::where('editor_id', $editorId)->where('estado', 'publicada')->where('activa', 1)->count(),
            'resenas' => Resena::where('editor_id', $editorId)->where('activa', 1)->where('estado', 'publicada')->count(),
            'promedio' => round($promedioValoracionesResenas, 1),
        ];

        $masPopular = Resena::where('editor_id', $editorId)
            ->where('activa', 1)
            ->where('estado', 'publicada')
            ->with(['pelicula.genero'])
            ->get()
            ->map(function ($resena) {
                $pelicula = $resena->pelicula;
                if (!$pelicula || $pelicula->activa == 0) {
                    return null;
                }

                $promedioResena = ValoracionResena::where('resena_id', $resena->id)->avg('puntuacion') ?? 0;

                return [
                    'id' => $pelicula->id,
                    'genero_id' => $pelicula->genero_id,
                    'genero_nombre' => $pelicula->genero ? $pelicula->genero->nombre : 'Sin género',
                    'titulo' => $pelicula->titulo,
                    'poster' => $pelicula->poster_path ?? '/dist/assets/img/posters/default.jpg',
                    'valoracion' => round($promedioResena, 1),
                    'sinopsis' => $pelicula->sinopsis ?? 'Sinopsis no disponible.',
                    'director' => $pelicula->director ?? 'N/A',
                    'anio' => $pelicula->anio ?? 'N/A',
                    'resena_titulo' => $resena->titulo,
                    'resena_contenido' => $resena->contenido,
                    'resena_calificacion' => $resena->calificacion,
                    'resena_estado' => $resena->estado,
                ];
            })
            ->filter()
            ->sortByDesc('valoracion')
            ->values()
            ->toArray();

        $generos = Schema::hasTable('generos') ? Genero::where('activo', 1)->get(['id', 'nombre']) : [];

        return Inertia::render('Editor/Estadisticas', [
            'auth' => ['user' => Auth::user()],
            'resenasPorSemana' => $resenasPorSemana,
            'comentariosPorSemana' => $comentariosPorSemana,
            'misPeliculas' => $misPeliculas,
            'masPopular' => $masPopular,
            'generos' => $generos,
        ]);
    }

    public function perfil(Request $request)
    {
        $this->checkEditor();

        return Inertia::render('Editor/Perfil', [
            'auth' => ['user' => Auth::user()],
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        $this->checkEditor();

        $user = User::find(Auth::id());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,correo,' . $user->id,
            'current_password' => 'nullable|required_with:password|string',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'password.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'current_password.required_with' => 'Debes ingresar tu contraseña actual para cambiarla.',
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

        return redirect()->back()->with('message', 'Tu perfil ha sido actualizado con éxito.');
    }
}