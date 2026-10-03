<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Valoracion extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la base de datos
    protected $table = 'valoraciones';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'usuario_id',
        'pelicula_id',
        'puntuacion',
    ];

    // Formateo de atributos
    protected $casts = [
        'puntuacion' => 'integer',
    ];

    /**
     * Relación: Una valoración pertenece a un usuario.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relación: Una valoración pertenece a una película.
     */
    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }
}

