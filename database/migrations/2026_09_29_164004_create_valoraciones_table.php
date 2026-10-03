<?php
// create_valoraciones_table
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('valoraciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('pelicula_id')->constrained('peliculas')->cascadeOnDelete();
            $table->unsignedTinyInteger('puntuacion'); // 1 a 5
            $table->timestamps();
            $table->unique(['usuario_id', 'pelicula_id']); // un usuario, una valoración por película
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('valoraciones');
    }
};