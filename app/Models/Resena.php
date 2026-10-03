<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la BD
    protected $table = 'resenas';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'pelicula_id',
        'editor_id',
        'titulo',
        'contenido',
        'calificacion',
        'estado',
        'activa',
    ];

    // Formateo automático de tipos
    protected $casts = [
        'calificacion' => 'float',
        'activa' => 'boolean',
    ];

    /**
     * Relación: La reseña pertenece a una Película.
     */
    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }

    /**
     * Relación: La reseña fue escrita por un Usuario (Editor).
     */
    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }
}

