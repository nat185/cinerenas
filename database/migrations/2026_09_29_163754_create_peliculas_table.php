<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peliculas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->foreignId('genero_id')->constrained('generos')->restrictOnDelete();
            
            // Actualizado de 'users' a 'usuarios'
            $table->foreignId('editor_id')->nullable()->constrained('usuarios')->nullOnDelete();
            
            $table->unsignedSmallInteger('anio')->nullable(); // Guardado como 'anio' sin ñ por seguridad técnica
            $table->string('director', 120)->nullable();
            $table->text('elenco')->nullable(); // actores principales
            $table->unsignedSmallInteger('duracion_min')->nullable();
            $table->string('pais', 80)->nullable();
            $table->json('plataformas_streaming')->nullable(); // ["Prime Video","HBO Max"]
            $table->text('sinopsis')->nullable();
            $table->string('trailer_url', 255)->nullable();

            // Poster: SOLO guardamos la ruta relativa, nunca el binario en la BD (evita lentitud)
            $table->string('poster_path', 255)->nullable();

            $table->enum('estado', ['borrador', 'publicada', 'archivada'])->default('borrador');
            $table->boolean('activa')->default(true); // deshabilitar sin borrar

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peliculas');
    }
};

