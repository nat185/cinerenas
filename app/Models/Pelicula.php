<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Models\ValoracionPelicula;



class Pelicula extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla
    protected $table = 'peliculas';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'titulo',
        'genero_id',
        'editor_id',
        'anio',
        'director',
        'elenco',
        'duracion_min',
        'pais',
        'plataformas_streaming',
        'sinopsis',
        'trailer_url',
        'poster_path',
        'estado',
        'activa',
    ];

    // Convierte automáticamente el JSON a array de PHP y tipos booleanos/enteros
    protected $casts = [
        'plataformas_streaming' => 'array',
        'activa' => 'boolean',
        'anio' => 'integer',
        'duracion_min' => 'integer',
    ];

    /**
     * Accesor para obtener la URL pública completa del póster.
     * Uso: $pelicula->poster_url
     */
    public function getPosterUrlAttribute(): ?string
    {
        return $this->poster_path ? Storage::url($this->poster_path) : null;
    }

    /**
     * Relación: Una película pertenece a un Género.
     */
    public function genero()
    {
        return $this->belongsTo(Genero::class, 'genero_id');
    }

    /**
     * Relación: Una película pertenece a un usuario (Editor que la creó/gestionó).
     */
    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    /**
     * Relación: Una película tiene muchos Comentarios.
     */
    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'pelicula_id');
    }

    /**
     * Relación: Una película tiene muchos Favoritos.
     */
    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'pelicula_id');
    }

    /**
     * Relación: Una película tiene muchas Reseñas (AÑADIDA PARA ESTADÍSTICAS).
     */
    public function resenas()
    {
        return $this->hasMany(Resena::class, 'pelicula_id');
    }

    public function valoracionesPelicula()
    {
        return $this->hasMany(ValoracionPelicula::class, 'pelicula_id');
    }


    /**
     * Relación: Una película tiene muchas Valoraciones (Opcional según tu BD).
     */
    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class, 'pelicula_id');
    }
}
