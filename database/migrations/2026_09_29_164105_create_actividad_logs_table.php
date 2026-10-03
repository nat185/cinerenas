<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividad_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tipo', 30); // registro, resena, comentario, valoracion, moderacion
            $table->string('descripcion', 255); // "Juan registró una cuenta"
            $table->foreignId('causante_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent(); // no necesita updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividad_logs');
    }
};
