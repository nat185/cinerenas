<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la base de datos
    protected $table = 'configuraciones';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'clave',
        'valor',
    ];

    /**
     * Método de conveniencia para obtener un valor por su clave.
     * Ejemplo de uso: Configuracion::get('nombre_plataforma', 'Mi Sitio');
     */
    public static function get(string $clave, $default = null)
    {
        $config = static::where('clave', $clave)->first();
        return $config ? $config->valor : $default;
    }

    /**
     * Método de conveniencia para establecer o actualizar una configuración.
     * Ejemplo de uso: Configuracion::set('nombre_plataforma', 'Nuevo Nombre');
     */
    public static function set(string $clave, $valor): static
    {
        return static::updateOrCreate(
            ['clave' => $clave],
            ['valor' => $valor]
        );
    }
}

