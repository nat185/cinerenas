<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActividadLog extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la base de datos
    protected $table = 'actividad_logs';

    // Desactivamos updated_at ya que la migración solo contempla created_at
    public $timestamps = false;

    // Indicamos que created_at debe tratarse como instancia de fecha/hora
    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'tipo',
        'descripcion',
        'causante_id',
        'created_at',
    ];

    /**
     * Relación: La actividad fue realizada por un usuario causante.
     */
    public function causante()
    {
        return $this->belongsTo(User::class, 'causante_id');
    }
}

