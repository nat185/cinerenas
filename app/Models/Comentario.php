<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    protected $fillable = [
        'usuario_id', 
        'pelicula_id', 
        'texto', 
        'calificacion', 
        'estado'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }

    // El texto NUNCA se sobreescribe desde el admin — solo se cambia 'estado'
    public function ocultar()
    {
        $this->update(['estado' => 'oculto']);
    }
}

