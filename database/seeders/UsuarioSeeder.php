<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Administrador Principal
        User::create([
            'nombre' => 'Administrador Principal',
            'correo' => 'admin@gmail.com',
            'contrasena' => Hash::make('password'), // o tu contraseña preferida
            'rol' => 'administrador',
            'estado' => 'activo',
            'correo_verificado_en' => now(),
        ]);

        // 2. Editor de Prueba
        User::create([
            'nombre' => 'Editor de Prueba',
            'correo' => 'editor@gmail.com',
            'contrasena' => Hash::make('password'),
            'rol' => 'editor',
            'estado' => 'activo',
            'correo_verificado_en' => now(),
        ]);

        // 3. Usuario Regular
        User::create([
            'nombre' => 'Usuario Ejemplo',
            'correo' => 'usuario@gmail.com',
            'contrasena' => Hash::make('password'),
            'rol' => 'usuario',
            'estado' => 'activo',
            'correo_verificado_en' => now(),
        ]);
    }
}

