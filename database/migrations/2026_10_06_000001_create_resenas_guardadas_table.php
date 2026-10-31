<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resenas_guardadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('resena_id')->constrained('resenas')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['usuario_id', 'resena_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas_guardadas');
    }
};