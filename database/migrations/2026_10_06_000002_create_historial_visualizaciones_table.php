<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_visualizaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('pelicula_id')->constrained('peliculas')->cascadeOnDelete();
            $table->timestamp('visto_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_visualizaciones');
    }
};