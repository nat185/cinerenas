<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Campos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'estado',
    ];

    /**
     * Campos ocultos al serializar (respuestas JSON / Inertia).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts de atributos.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Helpers prácticos para verificar roles.
     */
    public function esAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function esEditor(): bool
    {
        return $this->role === 'editor';
    }

    public function estaActivo(): bool
    {
        return $this->estado === 'activo';
    }

    /**
     * Relaciones de Eloquent
     */

    // Películas en las que figura como editor asignado
    public function peliculasEditadas()
    {
        return $this->hasMany(Pelicula::class, 'editor_id');
    }

    // Reseñas redactadas por el usuario
    public function resenas()
    {
        return $this->hasMany(Resena::class, 'editor_id');
    }

    // Comentarios publicados por el usuario
    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'usuario_id');
    }

    // Favoritos agregados por el usuario
    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'usuario_id');
    }

    // Reportes emitidos por el usuario
    public function reportesRealizados()
    {
        return $this->hasMany(ReporteModeracion::class, 'reportado_por_id');
    }
}

