<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorito extends Model
{
    use HasFactory;

    // Nombre de la tabla en la base de datos
    protected $table = 'favoritos';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'usuario_id',
        'pelicula_id',
    ];

    /**
     * Relación: Un favorito pertenece a un usuario.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relación: Un favorito pertenece a una película.
     */
    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }
}

