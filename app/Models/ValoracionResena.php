<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValoracionResena extends Model
{
    protected $table = 'valoraciones_resenas';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'resena_id',
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

    public function resena()
    {
        return $this->belongsTo(Resena::class, 'resena_id');
    }
}