<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
/**
 * @property int $id
 * @property string $nombre
 * @property string $correo
 * @property string $contrasena
 * @property string $rol
 * @property string $estado
 * @property string|null $active_session_id
 */

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios';

    // La tabla usa 'creado' y 'actualizado' en lugar de created_at / updated_at
    const CREATED_AT = 'creado';
    const UPDATED_AT = 'actualizado';

    protected $fillable = [
        'nombre',
        'correo',
        'contrasena',
        'rol',
        'estado',
        'active_session_id',
    ];

    protected $hidden = [
        'contrasena',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'correo_verificado_en' => 'datetime',
            'contrasena' => 'hashed',
        ];
    }

    // Laravel busca por este campo en Auth::attempt()
    public function username()
    {
        return 'correo';
    }

    public function getAuthPassword()
    {
        return $this->contrasena;
    }

    // Laravel 11/12 lo usa para el rehash automático de la contraseña
    public function getAuthPasswordName()
    {
        return 'contrasena';
    }

    public function getEmailForPasswordReset()
    {
        return $this->correo;
    }

    public function hasVerifiedEmail()
    {
        return ! is_null($this->correo_verificado_en);
    }

    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'correo_verificado_en' => $this->freshTimestamp(),
        ])->save();
    }

    public function esAdmin(): bool
    {
        return $this->rol === 'administrador';
    }

    public function esEditor(): bool
    {
        return $this->rol === 'editor';
    }

    public function estaActivo(): bool
    {
        return $this->estado === 'activo';
    }

    public function peliculasEditadas()
    {
        return $this->hasMany(Pelicula::class, 'editor_id');
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class, 'editor_id');
    }

    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'usuario_id');
    }

    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'usuario_id');
    }

    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class, 'usuario_id');
    }
    public function resenasGuardadas()
    {
        return $this->hasMany(ResenaGuardada::class, 'usuario_id');
    }

    public function reportesRealizados()
    {
        return $this->hasMany(ReporteModeracion::class, 'reportado_por_id');
    }
}