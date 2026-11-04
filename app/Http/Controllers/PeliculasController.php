<?php

namespace App\Http\Controllers;

use App\Models\Pelicula;
use App\Models\Genero;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PeliculasController extends Controller
{
    /**
     * Listado de películas y géneros para la tabla de administración.
     */
    public function index()
    {
        $peliculas = Pelicula::with(['genero', 'editor'])
            ->latest()
            ->paginate(10);

        // Se cargan TODOS los géneros (activos e inactivos) para la gestión
        $generos = Genero::withoutGlobalScope('activo')->latest()->get();

        return Inertia::render('Admin/Peliculas/Index', [
            'peliculas' => $peliculas,
            'generos'   => $generos
        ]);
    }

    /**
     * Formulario de creación.
     */
    public function create()
    {
        return Inertia::render('Admin/Peliculas/Create', [
            'generos' => Genero::all(), // El Global Scope filtra solo los activos automáticamente
            'editores' => User::where('role', 'editor')->get()
        ]);
    }

    /**
     * Guardar una nueva película.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'editor_id' => 'nullable|exists:users,id',
            'anio' => 'nullable|integer|min:1888|max:' . (date('Y') + 1),
            'director' => 'nullable|string|max:120',
            'elenco' => 'nullable|string',
            'duracion_min' => 'nullable|integer|min:1',
            'pais' => 'nullable|string|max:80',
            'plataformas_streaming' => 'nullable|array',
            'sinopsis' => 'nullable|string',
            'trailer_url' => 'nullable|url|max:255',
            'poster' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'estado' => 'required|in:borrador,publicada,archivada',
        ]);

        // Convertir array de plataformas_streaming a string separado por comas para tipo SET
        if (isset($validated['plataformas_streaming']) && is_array($validated['plataformas_streaming'])) {
            $validated['plataformas_streaming'] = implode(',', $validated['plataformas_streaming']);
        }

        if ($request->hasFile('poster')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($request->file('poster'));
            $image->cover(600, 900);

            $path = 'posters/' . uniqid() . '.webp';
            Storage::disk('public')->put($path, (string) $image->toWebp(80));
            $validated['poster_path'] = $path;
        }

        Pelicula::create($validated);

        return redirect()->route('admin.peliculas.index')->with('message', 'Película creada exitosamente.');
    }

    /**
     * Actualizar una película existente.
     */
    public function update(Request $request, Pelicula $pelicula)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'genero_id' => 'required|exists:generos,id',
            'editor_id' => 'nullable|exists:users,id',
            'anio' => 'nullable|integer|min:1888|max:' . (date('Y') + 1),
            'director' => 'nullable|string|max:120',
            'elenco' => 'nullable|string',
            'duracion_min' => 'nullable|integer|min:1',
            'pais' => 'nullable|string|max:80',
            'plataformas_streaming' => 'nullable|array',
            'sinopsis' => 'nullable|string',
            'trailer_url' => 'nullable|url|max:255',
            'poster' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'estado' => 'required|in:borrador,publicada,archivada',
        ]);

        // Convertir array de plataformas_streaming a string separado por comas para tipo SET
        if (isset($validated['plataformas_streaming']) && is_array($validated['plataformas_streaming'])) {
            $validated['plataformas_streaming'] = implode(',', $validated['plataformas_streaming']);
        }

        if ($request->hasFile('poster')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($request->file('poster'));
            $image->cover(600, 900);

            $path = 'posters/' . uniqid() . '.webp';
            Storage::disk('public')->put($path, (string) $image->toWebp(80));
            
            // Eliminar poster viejo si existe
            if ($pelicula->poster_path && Storage::disk('public')->exists($pelicula->poster_path)) {
                Storage::disk('public')->delete($pelicula->poster_path);
            }

            $validated['poster_path'] = $path;
        }

        $pelicula->update($validated);

        return redirect()->route('admin.peliculas.index')->with('message', 'Película actualizada exitosamente.');
    }

    /**
     * BAJA LÓGICA DE PELÍCULA
     */
    public function destroy(Pelicula $pelicula)
    {
        $pelicula->update([
            'activa' => false
        ]);

        return redirect()->back()->with('message', 'La película ha sido desactivada correctamente.');
    }

    public function toggleStatus(Pelicula $pelicula)
    {
        $pelicula->update([
            'activa' => !$pelicula->activa
        ]);

        $estadoTexto = $pelicula->activa ? 'activada' : 'desactivada';

        return redirect()->back()->with('message', "La película fue {$estadoTexto} correctamente.");
    }
}