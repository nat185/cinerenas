<?php

namespace App\Http\Controllers;

use App\Models\Genero;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GenerosController extends Controller
{
    public function index()
    {
        // Se usa withoutGlobalScope para que aquí SÍ se listen los inactivos 
        // y el administrador pueda verlos para restaurarlos.
        $generos = Genero::withoutGlobalScope('activo')->latest()->get();

        return Inertia::render('Admin/Generos/Index', [
            'generos' => $generos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:60|unique:generos,nombre',
            'descripcion' => 'nullable|string|max:255',
        ]);

        Genero::create($validated);

        return redirect()->back()->with('message', 'Género creado con éxito.');
    }

    public function update(Request $request, Genero $genero)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:60|unique:generos,nombre,' . $genero->id,
            'descripcion' => 'nullable|string|max:255',
        ]);

        $genero->update($validated);

        return redirect()->back()->with('message', 'Género actualizado.');
    }

    /**
     * BAJA LÓGICA: Se desactiva el género sin eliminarlo de la base de datos.
     */
    public function destroy(Genero $genero)
    {
        $genero->update([
            'activo' => false
        ]);

        return redirect()->back()->with('message', 'El género ha sido desactivado.');
    }

    /**
     * Alternar estado Activo / Inactivo.
     */
    public function toggleStatus(Genero $genero)
    {
        $genero->update([
            'activo' => !$genero->activo
        ]);

        return redirect()->back()->with('message', 'Estado del género actualizado.');
    }
}

