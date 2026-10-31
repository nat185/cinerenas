<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialVisualizacion extends Model
{
    public $timestamps = false;
    protected $table = 'historial_visualizaciones';
    protected $fillable = ['usuario_id', 'pelicula_id', 'visto_en'];
    protected $casts = [
        'visto_en' => 'datetime',
    ];

    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class);
    }
}
