<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReporteModeracion extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la base de datos
    protected $table = 'reportes_moderacion';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'comentario_id',
        'reportado_por_id',
        'motivo',
        'estado',
    ];

    /**
     * Relación: El reporte está asociado a un comentario.
     */
    public function comentario()
    {
        return $this->belongsTo(Comentario::class, 'comentario_id');
    }

    /**
     * Relación: El reporte fue generado por un usuario.
     */
    public function reportadoPor()
    {
        return $this->belongsTo(User::class, 'reportado_por_id');
    }
}

