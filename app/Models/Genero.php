<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genero extends Model
{
    use HasFactory;

    protected $table = 'generos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function peliculas()
    {
        return $this->hasMany(Pelicula::class, 'genero_id');
    }

    // Opcional: solo se aplica si TÚ lo llamas explícitamente, ej. Genero::activos()->get()
    // Útil para el futuro catálogo público del Usuario, nunca para el admin.
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}