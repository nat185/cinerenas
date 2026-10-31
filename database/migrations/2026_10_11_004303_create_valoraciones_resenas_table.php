<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('valoraciones_resenas', function (Blueprint $table) {
            $table->id();
            
            // Relación con la tabla usuarios
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            
            // Relación con la tabla resenas
            $table->foreignId('resena_id')->constrained('resenas')->onDelete('cascade');
            
            // Puntuación numérica (ej: 1 a 5)
            $table->tinyInteger('puntuacion')->unsigned();
            
            // Fechas de control idénticas a tus otras tablas
            $table->date('creado')->nullable();
            $table->date('actualizado')->nullable();

            // Restricción para que un usuario solo pueda calificar una vez la misma reseña
            $table->unique(['usuario_id', 'resena_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('valoraciones_resenas');
    }
};