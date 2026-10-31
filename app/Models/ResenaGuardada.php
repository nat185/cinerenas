<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResenaGuardada extends Model
{
    protected $table = 'resenas_guardadas';
    protected $fillable = ['usuario_id', 'resena_id'];

    public function resena()
    {
        return $this->belongsTo(Resena::class);
    }
}