<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValoracionPelicula extends Model
{
    protected $table = 'valoraciones_peliculas';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'pelicula_id',
        'puntuacion',
        'creado',
        'actualizado',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }
}