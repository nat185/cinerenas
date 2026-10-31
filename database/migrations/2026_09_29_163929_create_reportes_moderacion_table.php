<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_moderacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comentario_id')->nullable()->constrained('comentarios')->cascadeOnDelete();
            $table->foreignId('reportado_por_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('motivo', 150); // "Spam", "Lenguaje inapropiado", etc.
            $table->enum('estado', ['pendiente', 'revisado', 'aprobado', 'eliminado'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_moderacion');
    }
};