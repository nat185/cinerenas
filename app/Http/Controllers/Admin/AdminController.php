<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pelicula;
use App\Models\Genero;
use App\Models\User;
use App\Models\Comentario;
use App\Models\ReporteModeracion;
use App\Models\Configuracion;
use App\Models\ActividadLog;
use App\Models\Resena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminController extends Controller
{
    private function checkAdmin()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'No tienes permisos para entrar aquí.');
        }
    }

    public function dashboard(Request $request)
    {
        $this->checkAdmin();

        $promedioValoracion = 0;
        try {
            if (class_exists(Resena::class) && Schema::hasTable('resenas')) {
                $columna = Schema::hasColumn('resenas', 'calificacion') ? 'calificacion' : (Schema::hasColumn('resenas', 'puntuacion') ? 'puntuacion' : null);
                if ($columna) {
                    $promedioValoracion = round(Resena::avg($columna) ?? 0, 1);
                }
            } elseif (Schema::hasTable('comentarios')) {
                $columna = Schema::hasColumn('comentarios', 'calificacion') ? 'calificacion' : (Schema::hasColumn('comentarios', 'puntuacion') ? 'puntuacion' : null);
                if ($columna) {
                    $promedioValoracion = round(Comentario::avg($columna) ?? 0, 1);
                }
            }
        } catch (\Throwable $e) {
            $promedioValoracion = 0;
        }

        $stats = [
            'usuariosRegistrados'  => User::count(),
            'usuariosNuevosSemana' => User::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'peliculasRegistradas' => Pelicula::count(),
            'resenasCreadas'       => Schema::hasTable('resenas') ? Resena::count() : (Schema::hasTable('comentarios') ? Comentario::count() : 0),
            'comentariosRealizados'=> Schema::hasTable('comentarios') ? Comentario::count() : 0,
            'promedioValoracion'   => $promedioValoracion,
        ];

        $usuariosPorSemana = collect([3, 2, 1, 0])->map(function ($weeksAgo) {
            $start = Carbon::now()->subWeeks($weeksAgo)->startOfWeek();
            $end = Carbon::now()->subWeeks($weeksAgo)->endOfWeek();

            return [
                'label' => 'S' . (4 - $weeksAgo),
                'value' => User::whereBetween('created_at', [$start, $end])->count(),
            ];
        });

        $tematicasPopulares = [];
        try {
            if (Schema::hasTable('genero_pelicula') && Schema::hasTable('generos')) {
                $tematicasPopulares = DB::table('generos')
                    ->join('genero_pelicula', 'generos.id', '=', 'genero_pelicula.genero_id')
                    ->select('generos.nombre as label', DB::raw('count(genero_pelicula.pelicula_id) as value'))
                    ->groupBy('generos.id', 'generos.nombre')
                    ->orderByDesc('value')
                    ->limit(5)
                    ->get();
            } elseif (Schema::hasTable('generos') && Schema::hasColumn('peliculas', 'genero_id')) {
                $tematicasPopulares = DB::table('generos')
                    ->join('peliculas', 'generos.id', '=', 'peliculas.genero_id')
                    ->select('generos.nombre as label', DB::raw('count(peliculas.id) as value'))
                    ->groupBy('generos.id', 'generos.nombre')
                    ->orderByDesc('value')
                    ->limit(5)
                    ->get();
            }
        } catch (\Throwable $e) {
            $tematicasPopulares = [];
        }

        $reportesPendientesCount = 0;
        try {
            $reportesPendientesCount = ReporteModeracion::where('estado', 'pendiente')->count();
        } catch (\Throwable $e) {
            $reportesPendientesCount = 0;
        }

        $usuariosPendientesCount = 0;
        try {
            $usuariosPendientesCount = Schema::hasColumn('users', 'estado') 
                ? User::where('estado', 'inactivo')->orWhere('estado', 'pendiente')->count() 
                : 0;
        } catch (\Throwable $e) {
            $usuariosPendientesCount = 0;
        }

        $pendientes = [
            [
                'label' => 'Comentarios pendientes', 
                'value' => (Schema::hasTable('comentarios') && Schema::hasColumn('comentarios', 'estado')) 
                    ? Comentario::where('estado', 'pendiente')->count() 
                    : 0
            ],
            [
                'label' => 'Reportes pendientes', 
                'value' => $reportesPendientesCount
            ],
            [
                'label' => 'Usuarios pendientes', 
                'value' => $usuariosPendientesCount
            ],
            [
                'label' => 'Películas ocultas / inactivas', 
                'value' => Schema::hasColumn('peliculas', 'activa') 
                    ? Pelicula::where('activa', 0)->orWhere('estado', 'archivada')->count() 
                    : 0
            ],
        ];

        $rankingPeliculas = [];
        try {
            if (Schema::hasTable('resenas')) {
                $colCal = Schema::hasColumn('resenas', 'calificacion') ? 'calificacion' : (Schema::hasColumn('resenas', 'puntuacion') ? 'puntuacion' : 'calificacion');
                $rankingPeliculas = Pelicula::where('activa', true)
                    ->where('estado', '!=', 'archivada')
                    ->withAvg('resenas', $colCal)
                    ->orderByDesc('resenas_avg_' . $colCal)
                    ->limit(3)
                    ->get()
                    ->map(function ($pelicula) use ($colCal) {
                        $key = 'resenas_avg_' . $colCal;
                        return [
                            'titulo' => $pelicula->titulo ?? $pelicula->name ?? 'Sin título',
                            'valoracion' => round($pelicula->$key ?? 0, 1),
                            'poster' => $pelicula->poster_path ?? $pelicula->poster_url ?? $pelicula->poster ?? '/dist/assets/img/posters/default.jpg',
                        ];
                    });
            } else {
                $rankingPeliculas = Pelicula::where('activa', true)->where('estado', '!=', 'archivada')->latest()->limit(3)->get()->map(function ($pelicula) {
                    return [
                        'titulo' => $pelicula->titulo ?? $pelicula->name ?? 'Sin título',
                        'valoracion' => 0,
                        'poster' => $pelicula->poster_path ?? $pelicula->poster_url ?? '/dist/assets/img/posters/default.jpg',
                    ];
                });
            }
        } catch (\Throwable $e) {
            $rankingPeliculas = [];
        }

        $rankingVistas = [];
        try {
            $colVistas = Schema::hasColumn('peliculas', 'vistas_count') ? 'vistas_count' : (Schema::hasColumn('peliculas', 'vistas') ? 'vistas' : null);
            if ($colVistas) {
                $rankingVistas = Pelicula::where('activa', true)
                    ->where('estado', '!=', 'archivada')
                    ->orderByDesc($colVistas)
                    ->limit(3)
                    ->get()
                    ->map(function ($pelicula) use ($colVistas) {
                        return [
                            'titulo' => $pelicula->titulo ?? $pelicula->name ?? 'Sin título',
                            'vistas' => $pelicula->$colVistas ?? 0,
                        ];
                    });
            } else {
                $rankingVistas = Pelicula::where('activa', true)->where('estado', '!=', 'archivada')->latest()->limit(3)->get()->map(function ($pelicula) {
                    return [
                        'titulo' => $pelicula->titulo ?? $pelicula->name ?? 'Sin título',
                        'vistas' => 0,
                    ];
                });
            }
        } catch (\Throwable $e) {
            $rankingVistas = [];
        }

        $actividadReciente = [];
        try {
            if (Schema::hasTable('actividad_logs')) {
                $actividadReciente = ActividadLog::with('causante:id,name')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($actividad) {
                        return [
                            'texto' => $actividad->descripcion ?? ("Acción realizada por " . ($actividad->causante->name ?? 'Usuario')),
                            'tiempo' => $actividad->created_at ? $actividad->created_at->diffForHumans() : 'Hace un momento',
                            'icono' => 'fa-history',
                        ];
                    });
            }
        } catch (\Throwable $e) {
            $actividadReciente = [];
        }

        return Inertia::render('Admin/Dashboard', [
            'auth' => ['user' => Auth::user()],
            'stats' => $stats,
            'usuariosPorSemana' => $usuariosPorSemana,
            'tematicasPopulares' => $tematicasPopulares,
            'pendientes' => $pendientes,
            'rankingPeliculas' => $rankingPeliculas,
            'rankingVistas' => $rankingVistas,
            'actividadReciente' => $actividadReciente,
            'totales' => [
                'peliculas' => Pelicula::count(),
                'usuarios' => User::count(),
                'comentarios_pendientes' => (Schema::hasTable('comentarios') && Schema::hasColumn('comentarios', 'estado')) ? Comentario::where('estado', 'pendiente')->count() : 0,
                'reportes_pendientes' => $reportesPendientesCount,
            ],
        ]);
    }

    public function peliculas(Request $request)
    {
        $this->checkAdmin();

        return Inertia::render('Admin/Peliculas', [
            'auth' => ['user' => Auth::user()],
            'peliculas' => Pelicula::with(['genero', 'editor:id,name'])
                ->latest()
                ->get(),
            'generos' => Schema::hasTable('generos') ? Genero::all() : [],
        ]);
    }

    public function storePelicula(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'titulo'    => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'sinopsis'  => 'nullable|string',
            'estado'    => 'required|in:borrador,publicada,archivada',
            'activa'    => 'nullable|boolean',
            'poster'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $posterPath = null;
        if ($request->hasFile('poster')) {
            $posterPath = '/storage/' . $request->file('poster')->store('posters', 'public');
        }

        Pelicula::create([
            'titulo'      => $validated['titulo'],
            'genero_id'   => $validated['genero_id'],
            'editor_id'   => Auth::id(),
            'sinopsis'    => $validated['sinopsis'] ?? null,
            'estado'      => strtolower($validated['estado']),
            'activa'      => $validated['estado'] !== 'archivada' ? 1 : 0,
            'poster_path' => $posterPath,
        ]);

        return redirect()->back()->with('message', 'Película registrada correctamente.');
    }

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
        ]);

        if ($request->hasFile('poster')) {
            if ($pelicula->poster_path && Storage::disk('public')->exists(str_replace('/storage/', '', $pelicula->poster_path))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $pelicula->poster_path));
            }
            $pelicula->poster_path = '/storage/' . $request->file('poster')->store('posters', 'public');
        }

        $pelicula->update([
            'titulo'    => $validated['titulo'],
            'genero_id' => $validated['genero_id'],
            'sinopsis'  => $validated['sinopsis'] ?? null,
            'estado'    => strtolower($validated['estado']),
            'activa'    => $validated['estado'] !== 'archivada' ? 1 : 0,
        ]);

        return redirect()->back()->with('message', 'Película actualizada con éxito.');
    }

    public function destroyPelicula($id)
    {
        $this->checkAdmin();

        $pelicula = Pelicula::findOrFail($id);
        $estaInactiva = ($pelicula->activa == 0 || strtolower($pelicula->estado) === 'archivada');

        if ($estaInactiva) {
            $pelicula->update([
                'activa' => 1,
                'estado' => 'publicada',
            ]);
            $mensaje = 'La película ha sido reactivada y ya es visible en la plataforma.';
        } else {
            $pelicula->update([
                'activa' => 0,
                'estado' => 'archivada',
            ]);
            $mensaje = 'La película ha sido ocultada / inactiva correctamente.';
        }

        return redirect()->back()->with('message', $mensaje);
    }

    public function storeGenero(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'nombre'      => ['required', 'string', 'max:80', 'unique:generos,nombre', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'],
            'descripcion' => 'nullable|string',
        ], [
            'nombre.regex' => 'El nombre del género solo debe contener letras y espacios, sin números.'
        ]);

        Genero::create([
            'nombre'      => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'activo'      => 1,
        ]);

        return redirect()->back()->with('message', 'Género registrado correctamente.');
    }

    public function destroyGenero($id)
    {
        $this->checkAdmin();

        $genero = Genero::findOrFail($id);
        $nuevoEstado = (isset($genero->activo) && $genero->activo == 1) ? 0 : 1;

        $genero->update(['activo' => $nuevoEstado]);

        $mensaje = $nuevoEstado == 0 ? 'El género ha sido ocultado de los listados.' : 'El género ha sido restaurado con éxito.';
        return redirect()->back()->with('message', $mensaje);
    }

    public function comentarios(Request $request)
    {
        $this->checkAdmin();

        return Inertia::render('Admin/Comentarios', [
            'auth' => ['user' => Auth::user()],
            'comentarios' => Comentario::with(['usuario:id,name,email', 'pelicula:id,titulo'])
                ->latest()
                ->get(),
        ]);
    }

    public function destroyComentario($id)
    {
        $this->checkAdmin();

        $comentario = Comentario::findOrFail($id);
        $estadoActual = strtolower($comentario->estado ?? 'visible');
        $nuevoEstado = ($estadoActual === 'oculto') ? 'visible' : 'oculto';

        $comentario->update([
            'estado' => $nuevoEstado
        ]);

        $mensaje = $nuevoEstado === 'oculto' 
            ? 'El comentario ha sido ocultado correctamente.' 
            : 'El comentario ha sido restaurado y ya es visible.';

        return redirect()->back()->with('message', $mensaje);
    }

    public function cambiarEstadoComentario(Request $request, Comentario $comentario)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'estado' => 'required|in:visible,oculto,pendiente',
        ]);

        $comentario->update([
            'estado' => $validated['estado']
        ]);

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
            'usuarios' => User::latest()->get(),
        ]);
    }

    public function storeUser(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:admin,editor,user',
        ]);

        User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role'     => $validated['role'],
            'estado'   => 'activo',
        ]);

        return redirect()->back()->with('message', 'Usuario registrado correctamente.');
    }

    public function updateUserRole(Request $request, User $user)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'role' => 'required|in:admin,editor,user',
        ]);

        $user->update([
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('message', 'El rol del usuario ha sido actualizado con éxito.');
    }

    public function toggleUserStatus(User $user)
    {
        $this->checkAdmin();

        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'No puedes desactivar tu propia cuenta.');
        }

        $nuevoEstado = (strtolower($user->estado ?? 'activo') === 'activo') ? 'inactivo' : 'activo';
        
        $user->update([
            'estado' => $nuevoEstado
        ]);

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
                        'editor'      => $p->editor->name ?? 'Administrador',
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
                $generos = Genero::with(['peliculas' => function($query) use ($colCal) {
                    $query->where('estado', '!=', 'archivada')
                          ->withAvg('resenas', $colCal);
                }])->get();

                foreach ($generos as $gen) {
                    $totalPelis = $gen->peliculas->count();
                    $mejorPeli = $gen->peliculas->sortByDesc(function($p) use ($colCal) {
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
            'auth'                   => ['user' => Auth::user()],
            'peliculasMasComentadas' => $peliculasMasComentadas,
            'peliculasMasValoradas'  => $peliculasMasValoradas,
            'peliculasMenosValoradas'=> $peliculasMenosValoradas,
            'peliculasMasVistas'     => $peliculasMasVistas,
            'tematicasData'          => $tematicasData,
        ]);
    }

    public function moderacion(Request $request)
    {
        $this->checkAdmin();

        $reportes = [];
        $usuariosConIncidencias = [];

        try {
            $reportes = ReporteModeracion::where('estado', '!=', 'ocultar')
                ->latest()
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
                        'id'              => $rep->id,
                        'usuario_id'      => $usuario->id ?? ($reportador->id ?? 1),
                        'usuario_nombre'  => $usuario->name ?? ($reportador->name ?? 'Usuario del Sistema'),
                        'comentario_texto'=> $comentario->contenido ?? ($comentario->texto ?? 'Comentario no disponible'),
                        'pelicula_titulo' => $pelicula->titulo ?? ($pelicula->name ?? 'Película general'),
                        'motivo'          => $rep->motivo ?? 'Sin especificar',
                        'estado'          => $rep->estado ?? 'pendiente',
                        'created_at'      => $fechaFormateada,
                    ];
                });

            $reportesArchivados = ReporteModeracion::where('estado', 'archivar')->get();
            $conteoUsuarios = [];

            foreach ($reportesArchivados as $rep) {
                $com = Comentario::find($rep->comentario_id);
                if ($com && $com->usuario_id) {
                    $uId = $com->usuario_id;
                    if (!isset($conteoUsuarios[$uId])) {
                        $usrModel = User::find($uId);
                        $conteoUsuarios[$uId] = [
                            'usuario_id' => $uId,
                            'nombre'     => $usrModel->name ?? 'Usuario #' . $uId,
                            'estado'     => $usrModel->estado ?? 'activo',
                            'incidencias'=> 0,
                            'motivos'    => [],
                            'comentarios'=> [],
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
            'estado' => 'required|in:pendiente,ocultar,archivar',
        ]);

        $nuevoEstado = strtolower($validated['estado']);

        $reporte->update([
            'estado' => $nuevoEstado
        ]);

        $mensaje = $nuevoEstado === 'ocultar' 
            ? 'El reporte ha sido resuelto y ocultado de la lista activa, pero permanece guardado en la base de datos.' 
            : 'El estado del reporte ha sido actualizado correctamente.';

        return redirect()->back()->with('message', $mensaje);
    }

    public function inhabilitarUsuarioPorIncidencias(Request $request, $userId)
    {
        $this->checkAdmin();

        $usuario = User::findOrFail($userId);
        if ($usuario->id === Auth::id()) {
            return redirect()->back()->with('error', 'No puedes inhabilitar tu propia cuenta de administrador.');
        }

        $usuario->update([
            'estado' => 'inactivo'
        ]);

        return redirect()->back()->with('message', "El usuario {$usuario->name} ha sido inhabilitado exitosamente por acumulación de incidencias.");
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
        if (!in_array(Auth::user()->role, ['admin', 'editor'])) {
            abort(403, 'No tienes permisos para entrar aquí.');
        }

        $configuraciones = [];
        try {
            if (Schema::hasTable('configuracions')) {
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
            'name'             => 'required|string|max:255',
            'email'            => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'nullable|required_with:password|string',
            'password'         => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            if (!isset($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return redirect()->back()->withErrors(['current_password' => 'La contraseña actual es incorrecta.']);
            }
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        return redirect()->back()->with('message', 'El perfil ha sido actualizado con éxito.');
    }

    public function guardarConfiguracion(Request $request)
    {
        if (!in_array(Auth::user()->role, ['admin', 'editor'])) {
            abort(403, 'No tienes permisos.');
        }

        $data = $request->except('_token');

        if (Schema::hasTable('configuracions') && method_exists(Configuracion::class, 'set')) {
            foreach ($data as $clave => $valor) {
                Configuracion::set($clave, $valor);
            }
        }

        return redirect()->back()->with('message', 'Configuración general actualizada con éxito.');
    }
}


