<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la BD
    protected $table = 'resenas';

    // Definir nombres personalizados para las columnas de fecha (timestamps)
    const CREATED_AT = 'creado';
    const UPDATED_AT = 'actualizado';

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

    /**
     * Relación: La reseña puede tener muchas valoraciones de los usuarios.
     */
    public function valoracionesResena()
    {
        return $this->hasMany(ValoracionResena::class, 'resena_id');
    }

    /**
     * Scope para obtener solo reseñas vigentes (publicadas o en borrador y activas).
     */
    public function scopeVigentes($query)
    {
        return $query->where('activa', true)
            ->whereIn('estado', ['publicada', 'borrador']);
    }

    /**
     * Scope para obtener reseñas archivadas o inactivas (las que liberan la película).
     */
    public function scopeArchivadasOInactivas($query)
    {
        return $query->where(function ($q) {
            $q->where('activa', false)
                ->orWhere('estado', 'archivada');
        });
    }
}
