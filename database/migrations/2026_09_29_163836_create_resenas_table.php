<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resenas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelicula_id')->constrained('peliculas')->cascadeOnDelete();
            $table->foreignId('editor_id')->constrained('users')->restrictOnDelete();
            $table->string('titulo', 150);
            $table->text('contenido');
            $table->decimal('calificacion', 2, 1); // 0.0 a 5.0
            $table->enum('estado', ['borrador', 'publicada', 'archivada'])->default('borrador');
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas');
    }
};