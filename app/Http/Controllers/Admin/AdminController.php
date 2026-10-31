<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Pelicula;
use App\Models\Genero;
use App\Models\Comentario;
use App\Models\ReporteModeracion;
use App\Models\Resena;
use App\Models\Configuracion;
use App\Models\ValoracionPelicula;
use App\Models\ValoracionResena;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Verifica que el usuario actual tenga permisos de administrador.
     */
    private function checkAdmin()
    {
        $user = Auth::user();
        if (!$user || !in_array(strtolower($user->rol ?? ''), ['admin', 'administrador'])) {
            abort(403, 'Acceso no autorizado. Se requieren privilegios de administrador.');
        }
    }

    /**
     * Panel principal de administración / Dashboard.
     */
    public function Dashboard(Request $request)
    {
        $this->checkAdmin();

        $usuariosRegistrados = Schema::hasTable('usuarios') ? User::count() : 0;
        $usuariosNuevosSemana = User::where('creado', '>=', Carbon::now()->subDays(7))->count();

        $peliculasRegistradas = Schema::hasTable('peliculas') ? Pelicula::where('estado', 'publicada')->where('activa', 1)->count() : 0;
        $resenasCreadas = Schema::hasTable('resenas') ? Resena::where('estado', 'publicada')->where('activa', 1)->count() : 0;
        $comentariosRealizados = Schema::hasTable('comentarios') ? Comentario::count() : 0;

        $promedioPeliculas = Schema::hasTable('valoraciones_peliculas')
            ? DB::table('valoraciones_peliculas')->avg('puntuacion')
            : null;

        $promedioResenas = Schema::hasTable('valoraciones_resenas')
            ? DB::table('valoraciones_resenas')->avg('puntuacion')
            : null;

        if ($promedioPeliculas !== null && $promedioResenas !== null) {
            $promedioValoracion = ($promedioPeliculas + $promedioResenas) / 2;
        } else {
            $promedioValoracion = $promedioPeliculas ?? $promedioResenas ?? 0;
        }

        $stats = [
            'usuariosRegistrados'   => $usuariosRegistrados,
            'usuariosNuevosSemana'  => $usuariosNuevosSemana,
            'peliculasRegistradas'  => $peliculasRegistradas,
            'resenasCreadas'        => $resenasCreadas,
            'comentariosRealizados' => $comentariosRealizados,
            'promedioValoracion'    => round($promedioValoracion, 1),
        ];

        $usuariosPorSemana = collect([3, 2, 1, 0])->map(function ($weeksAgo) {
            $start = Carbon::now()->subWeeks($weeksAgo)->startOfWeek();
            $end = Carbon::now()->subWeeks($weeksAgo)->endOfWeek();

            return [
                'label' => 'S' . (4 - $weeksAgo),
                'value' => User::whereBetween('creado', [$start, $end])->count(),
            ];
        })->toArray();

        $reportesPendientes = 0;
        if (Schema::hasTable('reportes_moderacion')) {
            try {
                $reportesPendientes = ReporteModeracion::where('estado', 'pendiente')->count();
            } catch (\Throwable $e) {
                $reportesPendientes = 0;
            }
        }

        $peliculasSinResena = Pelicula::where('estado', 'publicada')
            ->where('activa', 1)
            ->whereDoesntHave('resenas')
            ->count();

        $pendientes = [
            ['label' => 'Reportes de Moderación Pendientes', 'value' => $reportesPendientes],
            ['label' => 'Películas sin Reseña Creada', 'value' => $peliculasSinResena],
        ];

        $rankingPeliculas = Pelicula::where('estado', 'publicada')
            ->where('activa', 1)
            ->get()
            ->map(function ($pelicula) {
                $promP = ValoracionPelicula::where('pelicula_id', $pelicula->id)->avg('puntuacion');
                return [
                    'titulo'     => $pelicula->titulo,
                    'poster'     => $pelicula->poster_path ?? '/dist/assets/img/posters/default.jpg',
                    'valoracion' => round($promP ?? 0, 1),
                ];
            })
            ->sortByDesc('valoracion')
            ->take(4)
            ->values()
            ->toArray();

        $rankingVistas = Pelicula::where('estado', 'publicada')
            ->where('activa', 1)
            ->withCount('comentarios')
            ->orderBy('comentarios_count', 'desc')
            ->take(4)
            ->get()
            ->map(fn ($p) => [
                'titulo' => $p->titulo,
                'vistas' => $p->comentarios_count,
            ])
            ->toArray();

        $actividadReciente = Comentario::with('usuario:id,nombre')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($c) => [
                'icono'  => 'fa-comment',
                'texto'  => ($c->usuario->nombre ?? 'Usuario') . ' comentó en una película',
                'tiempo' => $c->created_at ? Carbon::parse($c->created_at)->diffForHumans() : 'Recientemente',
            ])
            ->toArray();

        return Inertia::render('Admin/Dashboard', [
            'auth'              => ['user' => Auth::user()],
            'stats'             => $stats,
            'usuariosPorSemana' => $usuariosPorSemana,
            'pendientes'        => $pendientes,
            'rankingPeliculas'  => $rankingPeliculas,
            'rankingVistas'     => $rankingVistas,
            'actividadReciente' => $actividadReciente,
        ]);
    }

    /**
     * Gestión de Películas: Listado completo con reseña asociada
     * y valoración combinada (valoraciones_peliculas + valoraciones_resenas).
     */
    public function peliculas(Request $request)
    {
        $this->checkAdmin();

        $peliculas = Pelicula::with(['genero', 'editor:id,nombre'])
            ->latest()
            ->get()
            ->map(function ($p) {
                // Reseña asociada a esta película (si existe)
                $resena = Resena::where('pelicula_id', $p->id)->orderByDesc('id')->first();

                // Valoraciones directas a la PELÍCULA
                $promPelicula = 0;
                $totalPelicula = 0;
                try {
                    $promPelicula = ValoracionPelicula::where('pelicula_id', $p->id)->avg('puntuacion') ?? 0;
                    $totalPelicula = ValoracionPelicula::where('pelicula_id', $p->id)->count();
                } catch (\Throwable $e) {
                    $promPelicula = 0;
                    $totalPelicula = 0;
                }

                // Valoraciones a la RESEÑA (si existe reseña)
                $promResena = 0;
                $totalResena = 0;
                if ($resena) {
                    try {
                        $promResena = ValoracionResena::where('resena_id', $resena->id)->avg('puntuacion') ?? 0;
                        $totalResena = ValoracionResena::where('resena_id', $resena->id)->count();
                    } catch (\Throwable $e) {
                        $promResena = 0;
                        $totalResena = 0;
                    }
                }

                // Combinación inteligente: si el usuario valoró ambos, se pondera por cantidad;
                // si solo valoró uno de los dos, se usa ese; si no hay ninguno, 0.
                if ($totalPelicula > 0 && $totalResena > 0) {
                    $valoracionCombinada = (($promPelicula * $totalPelicula) + ($promResena * $totalResena))
                        / ($totalPelicula + $totalResena);
                    $origenValoracion = 'Promedio combinado (valoraciones de película + reseña)';
                } elseif ($totalPelicula > 0) {
                    $valoracionCombinada = $promPelicula;
                    $origenValoracion = 'Solo valoraciones registradas a la película';
                } elseif ($totalResena > 0) {
                    $valoracionCombinada = $promResena;
                    $origenValoracion = 'Solo valoraciones registradas a la reseña';
                } else {
                    $valoracionCombinada = 0;
                    $origenValoracion = 'Sin valoraciones registradas';
                }

                $p->resena_asociada = $resena ? [
                    'id'          => $resena->id,
                    'pelicula_id' => $resena->pelicula_id,
                    'editor_id'   => $resena->editor_id,
                    'titulo'      => $resena->titulo,
                    'contenido'   => $resena->contenido,
                    'estado'      => $resena->estado,
                    'activa'      => $resena->activa,
                ] : null;

                $p->valoracion_pelicula_promedio = round($promPelicula, 1);
                $p->valoracion_pelicula_total    = $totalPelicula;
                $p->valoracion_resena_promedio   = round($promResena, 1);
                $p->valoracion_resena_total      = $totalResena;
                $p->valoracion                   = round($valoracionCombinada, 1);
                $p->valoracion_origen            = $origenValoracion;

                return $p;
            });

        return Inertia::render('Admin/Peliculas', [
            'auth'      => ['user' => Auth::user()],
            'peliculas' => $peliculas,
            // Sin scope: incluye activos e inactivos para la gestión de géneros
            'generos'   => Schema::hasTable('generos') ? Genero::orderBy('nombre')->get() : [],
        ]);
    }

    /**
     * Almacenar una nueva película (con validación de duplicados).
     */
    public function storePelicula(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'titulo'    => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'sinopsis'  => 'nullable|string',
            'estado'    => 'required|in:borrador,publicada,archivada',
            'poster'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'titulo.required' => 'El título de la película es obligatorio.',
        ]);

        // Duplicado insensible a mayúsculas/minúsculas y a espacios
        $existeTitulo = Pelicula::whereRaw('LOWER(titulo) = ?', [strtolower(trim($validated['titulo']))])->exists();
        if ($existeTitulo) {
            return redirect()->back()
                ->withErrors(['titulo' => 'Ya existe una película registrada con este título en la base de datos.'])
                ->withInput();
        }

        $posterPath = null;
        if ($request->hasFile('poster')) {
            $posterPath = '/storage/' . $request->file('poster')->store('posters', 'public');
        }

        Pelicula::create([
            'titulo'      => trim($validated['titulo']),
            'genero_id'   => $validated['genero_id'],
            'editor_id'   => Auth::id(),
            'sinopsis'    => $validated['sinopsis'] ?? null,
            'estado'      => strtolower($validated['estado']),
            'activa'      => $validated['estado'] !== 'archivada' ? 1 : 0,
            'poster_path' => $posterPath,
        ]);

        return redirect()->back()->with('message', 'Película registrada correctamente.');
    }

    /**
     * Actualizar una película existente (con validación de duplicados).
     */
    public function updatePelicula(Request $request, $id)
    {
        $this->checkAdmin();

        $pelicula = Pelicula::findOrFail($id);

        $validated = $request->validate([
            'titulo'    => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'sinopsis'  => 'nullable|string',
            'estado'    => 'required|in:borrador,publicada,archivada',
            'poster'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'titulo.required' => 'El título de la película es obligatorio.',
        ]);

        $existeTitulo = Pelicula::whereRaw('LOWER(titulo) = ?', [strtolower(trim($validated['titulo']))])
            ->where('id', '!=', $id)
            ->exists();

        if ($existeTitulo) {
            return redirect()->back()
                ->withErrors(['titulo' => 'Ya existe otra película con este título en la base de datos.'])
                ->withInput();
        }

        if ($request->hasFile('poster')) {
            if ($pelicula->poster_path && Storage::disk('public')->exists(str_replace('/storage/', '', $pelicula->poster_path))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $pelicula->poster_path));
            }
            $pelicula->poster_path = '/storage/' . $request->file('poster')->store('posters', 'public');
        }

        $pelicula->update([
            'titulo'    => trim($validated['titulo']),
            'genero_id' => $validated['genero_id'],
            'sinopsis'  => $validated['sinopsis'] ?? null,
            'estado'    => strtolower($validated['estado']),
            'activa'    => $validated['estado'] !== 'archivada' ? 1 : 0,
        ]);

        return redirect()->back()->with('message', 'Película actualizada con éxito.');
    }

    /**
     * Cambiar estado / Ocultar o Activar película (nunca se elimina de la BD).
     */
    public function destroyPelicula($id)
    {
        $this->checkAdmin();

        $pelicula = Pelicula::findOrFail($id);
        $estaInactiva = ($pelicula->activa == 0 || strtolower($pelicula->estado) === 'archivada');

        if ($estaInactiva) {
            $pelicula->update(['activa' => 1, 'estado' => 'publicada']);
            $mensaje = 'La película ha sido reactivada y ya es visible en la plataforma.';
        } else {
            $pelicula->update(['activa' => 0, 'estado' => 'archivada']);
            $mensaje = 'La película ha sido ocultada / inactiva correctamente.';
        }

        return redirect()->back()->with('message', $mensaje);
    }

    /**
     * Registrar un nuevo género (con validación de duplicados insensible a mayúsculas/espacios).
     */
    public function storeGenero(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:80', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'],
            'descripcion' => 'nullable|string',
        ], [
            'nombre.required' => 'El nombre del género es obligatorio.',
            'nombre.regex'    => 'El nombre del género solo debe contener letras y espacios, sin números.',
        ]);

        $existeNombre = Genero::whereRaw('LOWER(nombre) = ?', [strtolower(trim($validated['nombre']))])->exists();
        if ($existeNombre) {
            return redirect()->back()
                ->withErrors(['nombre' => 'Ya existe un género registrado con este nombre en la base de datos.'])
                ->withInput();
        }

        Genero::create([
            'nombre'      => trim($validated['nombre']),
            'descripcion' => $validated['descripcion'] ?? null,
            'activo'      => 1,
        ]);

        return redirect()->back()->with('message', 'Género registrado correctamente.');
    }

    /**
     * Editar un género existente (con validación de duplicados).
     */
    public function updateGenero(Request $request, $id)
    {
        $this->checkAdmin();

        $genero = Genero::findOrFail($id);

        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:80', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'],
            'descripcion' => 'nullable|string',
        ], [
            'nombre.required' => 'El nombre del género es obligatorio.',
            'nombre.regex'    => 'El nombre del género solo debe contener letras y espacios, sin números.',
        ]);

        $existeNombre = Genero::whereRaw('LOWER(nombre) = ?', [strtolower(trim($validated['nombre']))])
            ->where('id', '!=', $id)
            ->exists();

        if ($existeNombre) {
            return redirect()->back()
                ->withErrors(['nombre' => 'Ya existe otro género con este nombre en la base de datos.'])
                ->withInput();
        }

        $genero->update([
            'nombre'      => trim($validated['nombre']),
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        return redirect()->back()->with('message', 'Género actualizado correctamente.');
    }

    /**
     * Habilitar / Deshabilitar un género (nunca se elimina de la BD).
     */
    public function destroyGenero($id)
    {
        $this->checkAdmin();

        $genero = Genero::findOrFail($id);
        $nuevoEstado = (isset($genero->activo) && $genero->activo == 1) ? 0 : 1;

        $genero->update(['activo' => $nuevoEstado]);

        $mensaje = $nuevoEstado == 0
            ? 'El género ha sido deshabilitado y ya no aparecerá disponible para nuevas películas.'
            : 'El género ha sido habilitado nuevamente con éxito.';

        return redirect()->back()->with('message', $mensaje);
    }

    /**
     * Gestión de Comentarios.
     */
    public function comentarios(Request $request)
    {
        $this->checkAdmin();

        return Inertia::render('Admin/Comentarios', [
            'auth' => ['user' => Auth::user()],
            'comentarios' => Comentario::with(['usuario:id,nombre,correo', 'pelicula:id,titulo'])
                ->latest()
                ->get(),
        ]);
    }

    public function destroyComentario($id)
    {
        $this->checkAdmin();

        $comentario = Comentario::findOrFail($id);
        $estadoActual = strtolower($comentario->estado ?? 'visible');
        $nuevoEstado = ($estadoActual === 'oculto' || $estadoActual === 'inactivo') ? 'visible' : 'oculto';

        $comentario->update(['estado' => $nuevoEstado]);

        $mensaje = ($nuevoEstado === 'oculto' || $nuevoEstado === 'inactivo')
            ? 'El comentario ha sido ocultado correctamente.'
            : 'El comentario ha sido restaurado y ya es visible.';

        return redirect()->back()->with('message', $mensaje);
    }

    public function cambiarEstadoComentario(Request $request, Comentario $comentario)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'estado' => 'required|in:visible,oculto,inactivo,pendiente',
        ]);

        $comentario->update(['estado' => $validated['estado']]);

        return redirect()->back()->with('message', 'Estado del comentario actualizado correctamente.');
    }

    public function storeReporteModeracion(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'comentario_id' => 'required|exists:comentarios,id',
            'tipo_reporte'  => 'required|string|max:100',
            'motivo'        => 'required|string|max:500',
        ]);

        $motivoCompleto = "[" . $validated['tipo_reporte'] . "] " . $validated['motivo'];

        ReporteModeracion::create([
            'comentario_id'    => $validated['comentario_id'],
            'reportado_por_id' => Auth::id(),
            'motivo'           => $motivoCompleto,
            'estado'           => 'pendiente',
        ]);

        return redirect()->back()->with('message', 'El reporte ha sido registrado exitosamente en moderación.');
    }

    public function usuarios(Request $request)
    {
        $this->checkAdmin();

        return Inertia::render('Admin/Usuarios', [
            'auth' => ['user' => Auth::user()],
            'usuarios' => User::orderByDesc('creado')->get(),
        ]);
    }

    public function storeUser(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:usuarios,correo',
            'password' => 'required|string|min:6|confirmed',
            'rol'      => 'required|in:administrador,editor,usuario',
        ]);

        User::create([
            'nombre'     => $validated['name'],
            'correo'     => $validated['email'],
            'contrasena' => Hash::make($validated['password']),
            'rol'        => $validated['rol'],
            'estado'     => 'activo',
        ]);

        return redirect()->back()->with('message', 'Usuario registrado correctamente.');
    }

    public function updateUserRole(Request $request, $id)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'rol' => 'required|in:administrador,editor,usuario',
        ]);

        $usuario = User::findOrFail($id);
        $usuario->rol = $validated['rol'];
        $usuario->save();

        return redirect()->back()->with('message', 'El rol del usuario ha sido actualizado con éxito.');
    }

    public function toggleUserStatus($id)
    {
        $this->checkAdmin();

        $usuario = User::findOrFail($id);

        if ($usuario->id === Auth::id()) {
            return redirect()->back()->with('error', 'No puedes desactivar tu propia cuenta.');
        }

        $nuevoEstado = (strtolower($usuario->estado ?? 'activo') === 'activo') ? 'inactivo' : 'activo';

        $usuario->update(['estado' => $nuevoEstado]);

        return redirect()->back()->with('message', "El usuario fue cambiado a {$nuevoEstado} exitosamente.");
    }

    public function estadisticas(Request $request)
    {
        $this->checkAdmin();

        $colCal = Schema::hasColumn('resenas', 'calificacion') ? 'calificacion' : (Schema::hasColumn('resenas', 'puntuacion') ? 'puntuacion' : 'calificacion');
        $colVistas = Schema::hasColumn('peliculas', 'vistas_count') ? 'vistas_count' : (Schema::hasColumn('peliculas', 'vistas') ? 'vistas' : null);

        $mapearPeliculas = function ($query) use ($colCal, $colVistas) {
            return $query->get()
                ->map(function ($p) use ($colCal, $colVistas) {
                    $promedio = method_exists($p, 'resenas') ? ($p->resenas()->avg($colCal) ?? 0) : 0;
                    $poster = $p->poster_path ?? $p->poster_url ?? null;
                    if ($poster && !str_starts_with($poster, 'http') && !str_starts_with($poster, '/storage')) {
                        $poster = '/storage/' . $poster;
                    }
                    return [
                        'id'          => $p->id,
                        'titulo'      => $p->titulo ?? $p->name ?? 'Sin título',
                        'valoracion'  => round($promedio, 1) . '★',
                        'comentarios' => method_exists($p, 'comentarios') ? $p->comentarios()->count() : 0,
                        'vistas'      => $colVistas ? ($p->$colVistas ?? 0) : (method_exists($p, 'favoritos') ? $p->favoritos()->count() * 10 : rand(50, 200)),
                        'editor'      => $p->editor->nombre ?? 'Administrador',
                        'estreno'     => $p->created_at ? $p->created_at->format('Y') : '2026',
                        'reseña'      => $p->sinopsis ?? 'Sin descripción detallada registrada para esta película.',
                        'poster'      => $poster,
                    ];
                });
        };

        $peliculasMasComentadas = $mapearPeliculas(
            Pelicula::where('estado', '!=', 'archivada')
                ->withCount('comentarios')
                ->orderByDesc('comentarios_count')
                ->limit(5)
        );

        $peliculasMasValoradas = $mapearPeliculas(
            Pelicula::where('estado', '!=', 'archivada')
                ->withAvg('resenas', $colCal)
                ->orderByDesc('resenas_avg_' . $colCal)
                ->limit(5)
        );

        $peliculasMenosValoradas = Pelicula::where('estado', '!=', 'archivada')
            ->withAvg('resenas', $colCal)
            ->orderBy('resenas_avg_' . $colCal, 'asc')
            ->limit(3)
            ->get()
            ->map(function ($p) use ($colCal) {
                $promedio = $p->{'resenas_avg_' . $colCal} ?? 0;
                return [
                    'id'          => $p->id,
                    'titulo'      => $p->titulo ?? $p->name ?? 'Sin título',
                    'valoracion'  => round($promedio, 1) . '★',
                    'comentarios' => method_exists($p, 'comentarios') ? $p->comentarios()->count() : 0,
                ];
            });

        $queryVistas = Pelicula::where('estado', '!=', 'archivada');
        if ($colVistas) {
            $queryVistas->orderByDesc($colVistas);
        } else {
            $queryVistas->latest();
        }
        $peliculasMasVistas = $mapearPeliculas($queryVistas->limit(5));

        $tematicasData = [];
        try {
            if (Schema::hasTable('generos')) {
                $generos = Genero::where('activo', 1)->with(['peliculas' => function ($query) use ($colCal) {
                    $query->where('estado', '!=', 'archivada')->withAvg('resenas', $colCal);
                }])->get();

                foreach ($generos as $gen) {
                    $totalPelis = $gen->peliculas->count();
                    $mejorPeli = $gen->peliculas->sortByDesc(function ($p) use ($colCal) {
                        return $p->{'resenas_avg_' . $colCal} ?? 0;
                    })->first();

                    $tematicasData[] = [
                        'label'           => $gen->nombre,
                        'value'           => $totalPelis,
                        'descripcion'     => $gen->descripcion ?? 'Género registrado en el catálogo.',
                        'mejor_pelicula'  => $mejorPeli ? ($mejorPeli->titulo ?? $mejorPeli->name) : 'Sin películas asociadas',
                        'calificacion_mp' => $mejorPeli ? round($mejorPeli->{'resenas_avg_' . $colCal} ?? 0, 1) . '★' : '0★',
                    ];
                }
            }
        } catch (\Throwable $e) {
            $tematicasData = [];
        }

        return Inertia::render('Admin/Estadisticas', [
            'auth'                    => ['user' => Auth::user()],
            'peliculasMasComentadas'  => $peliculasMasComentadas,
            'peliculasMasValoradas'   => $peliculasMasValoradas,
            'peliculasMenosValoradas' => $peliculasMenosValoradas,
            'peliculasMasVistas'      => $peliculasMasVistas,
            'tematicasData'           => $tematicasData,
        ]);
    }

    public function moderacion(Request $request)
    {
        $this->checkAdmin();

        $reportes = [];
        $usuariosConIncidencias = [];

        try {
            $reportes = ReporteModeracion::latest()
                ->get()
                ->map(function ($rep) {
                    $comentario = Comentario::find($rep->comentario_id);
                    $usuario = $comentario ? User::find($comentario->usuario_id) : null;
                    $pelicula = $comentario ? Pelicula::find($comentario->pelicula_id) : null;
                    $reportador = User::find($rep->reportado_por_id);

                    $fechaFormateada = 'N/A';
                    if ($rep->created_at) {
                        $fechaFormateada = $rep->created_at->format('j/n/Y');
                    }

                    return [
                        'id'               => $rep->id,
                        'usuario_id'       => $usuario->id ?? ($reportador->id ?? 1),
                        'usuario_nombre'   => $usuario->nombre ?? ($reportador->nombre ?? 'Usuario del Sistema'),
                        'comentario_texto' => $comentario->contenido ?? ($comentario->texto ?? 'Comentario no disponible'),
                        'pelicula_titulo'  => $pelicula->titulo ?? ($pelicula->name ?? 'Película general'),
                        'motivo'           => $rep->motivo ?? 'Sin especificar',
                        'estado'           => $rep->estado ?? 'pendiente',
                        'created_at'       => $fechaFormateada,
                    ];
                });

            $reportesEliminados = ReporteModeracion::where('estado', 'eliminado')->get();
            $conteoUsuarios = [];

            foreach ($reportesEliminados as $rep) {
                $com = Comentario::find($rep->comentario_id);
                if ($com && $com->usuario_id) {
                    $uId = $com->usuario_id;
                    if (!isset($conteoUsuarios[$uId])) {
                        $usrModel = User::find($uId);
                        $conteoUsuarios[$uId] = [
                            'usuario_id'  => $uId,
                            'nombre'      => $usrModel->nombre ?? 'Usuario #' . $uId,
                            'estado'      => $usrModel->estado ?? 'activo',
                            'incidencias' => 0,
                            'motivos'     => [],
                            'comentarios' => [],
                        ];
                    }
                    $conteoUsuarios[$uId]['incidencias']++;
                    $conteoUsuarios[$uId]['motivos'][] = $rep->motivo;
                    $conteoUsuarios[$uId]['comentarios'][] = $com->contenido ?? $com->texto ?? 'Comentario';
                }
            }

            foreach ($conteoUsuarios as $dataUser) {
                if ($dataUser['incidencias'] >= 5) {
                    $usuariosConIncidencias[] = [
                        'usuario_id'  => $dataUser['usuario_id'],
                        'nombre'      => $dataUser['nombre'],
                        'estado'      => $dataUser['estado'],
                        'incidencias' => $dataUser['incidencias'],
                        'motivos'     => implode(', ', array_unique($dataUser['motivos'])),
                        'comentarios' => implode(' | ', array_slice(array_unique($dataUser['comentarios']), 0, 3)),
                    ];
                }
            }
        } catch (\Throwable $e) {
            $reportes = [];
            $usuariosConIncidencias = [];
        }

        return Inertia::render('Admin/Moderacion', [
            'auth'                   => ['user' => Auth::user()],
            'reportes'               => $reportes,
            'usuariosConIncidencias' => $usuariosConIncidencias,
        ]);
    }

    public function cambiarEstadoModeracion(Request $request, ReporteModeracion $reporte)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,revisado,aprobado,eliminado',
        ]);

        $nuevoEstado = strtolower($validated['estado']);
        $reporte->update(['estado' => $nuevoEstado]);

        if ($nuevoEstado === 'eliminado' && $reporte->comentario_id) {
            $comentario = Comentario::find($reporte->comentario_id);
            if ($comentario) {
                $comentario->update(['estado' => 'oculto']);
            }
        } elseif ($nuevoEstado === 'aprobado' && $reporte->comentario_id) {
            $comentario = Comentario::find($reporte->comentario_id);
            if ($comentario) {
                $comentario->update(['estado' => 'visible']);
            }
        }

        return redirect()->back()->with('message', 'El estado del reporte ha sido actualizado correctamente.');
    }

    public function inhabilitarUsuarioPorIncidencias(Request $request, $userId)
    {
        $this->checkAdmin();

        $usuario = User::findOrFail($userId);
        if ($usuario->id === Auth::id()) {
            return redirect()->back()->with('error', 'No puedes inhabilitar tu propia cuenta de administrador.');
        }

        $usuario->update(['estado' => 'inactivo']);

        return redirect()->back()->with('message', "El usuario {$usuario->nombre} ha sido inhabilitado exitosamente por acumulación de incidencias.");
    }

    public function destroyModeracion($reporteId)
    {
        $this->checkAdmin();

        $reporte = ReporteModeracion::findOrFail($reporteId);
        $reporte->delete();

        return redirect()->back()->with('message', 'El reporte de moderación ha sido eliminado correctamente.');
    }

    public function configuracion(Request $request)
    {
        $user = Auth::user();
        if (!$user || !in_array(strtolower($user->rol ?? ''), ['admin', 'administrador', 'editor'])) {
            abort(403, 'No tienes permisos para entrar aquí.');
        }

        $configuraciones = [];
        try {
            if (Schema::hasTable('configuraciones')) {
                $configuraciones = Configuracion::all()->pluck('valor', 'clave');
            }
        } catch (\Throwable $e) {
            $configuraciones = [];
        }

        $generosDisponibles = [];
        try {
            if (Schema::hasTable('generos')) {
                $generosDisponibles = Genero::pluck('nombre')->toArray();
            }
        } catch (\Throwable $e) {
            $generosDisponibles = [];
        }

        return Inertia::render('Admin/Configuracion', [
            'auth'            => ['user' => Auth::user()],
            'configuraciones' => $configuraciones,
            'generosDb'       => implode(', ', $generosDisponibles),
        ]);
    }

    public function actualizarPerfilAdmin(Request $request, User $user)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'nombre'           => 'required|string|max:255',
            'correo'           => 'required|string|email|max:255|unique:usuarios,correo,' . $user->id,
            'current_password' => 'nullable|required_with:password|string',
            'password'         => 'nullable|string|min:8|confirmed',
        ]);

        $user->nombre = $validated['nombre'];
        $user->correo = $validated['correo'];

        if (!empty($validated['password'])) {
            if (!isset($validated['current_password']) || !Hash::check($validated['current_password'], $user->contrasena)) {
                return redirect()->back()->withErrors(['current_password' => 'La contraseña actual es incorrecta.']);
            }
            $user->contrasena = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->back()->with('message', 'El perfil ha sido actualizado con éxito.');
    }

    public function guardarConfiguracion(Request $request)
    {
        $user = Auth::user();
        if (!$user || !in_array(strtolower($user->rol ?? ''), ['admin', 'administrador', 'editor'])) {
            abort(403, 'No tienes permisos.');
        }

        $data = $request->except('_token');

        if (Schema::hasTable('configuraciones') && method_exists(Configuracion::class, 'set')) {
            foreach ($data as $clave => $valor) {
                Configuracion::set($clave, $valor);
            }
        }

        return redirect()->back()->with('message', 'Configuración general actualizada con éxito.');
    }
}