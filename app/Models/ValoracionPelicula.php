<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValoracionPelicula extends Model
{
    protected $table = 'valoraciones_peliculas';
    public $timestamps = false; // La tabla usa 'creado' y 'actualizado' en lugar de created_at/updated_at

    protected $fillable = [
        'usuario_id',
        'pelicula_id',
        'puntuacion',
        'creado',
        'actualizado',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->creado = now()->toDateString();
        });

        static::updating(function ($model) {
            $model->actualizado = now()->toDateString();
        });
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }
}