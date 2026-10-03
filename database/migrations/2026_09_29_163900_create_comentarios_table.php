<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comentarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('pelicula_id')->constrained('peliculas')->cascadeOnDelete();
            $table->text('texto');
            $table->unsignedTinyInteger('calificacion')->nullable(); // 1-5, si aplica
            // Exactamente el flujo que ya tienes en Comentarios.jsx: Visible / Oculto / En revisión
            $table->enum('estado', ['visible', 'oculto', 'en_revision'])->default('visible');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comentarios');
    }
};