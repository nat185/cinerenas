<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialVisualizacion extends Model
{
    public $timestamps = false;
    protected $table = 'historial_visualizaciones';
    protected $fillable = ['usuario_id', 'pelicula_id', 'vista', 'visto_en'];
    protected $casts = [
        'vista' => 'boolean',
        'visto_en' => 'datetime',
    ];

    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }
}
