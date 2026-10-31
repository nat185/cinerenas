<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validamos usando los nombres en español acordes a tu base de datos ('correo', 'contrasena')
        $request->validate([
            'nombre'     => ['required', 'string', 'max:255'],
            'correo'     => ['required', 'string', 'email', 'max:255', 'unique:usuarios,correo'], 
            'contrasena' => ['required', 'min:6', 'confirmed'],
        ]);

        // 2. Generamos el identificador de sesión para la pestaña (igual que en tu LoginController)
        $tabId = $request->header('X-Tab-Session') ?? Str::random(40);

        // 3. Creamos el usuario asignando explícitamente las columnas en español de tu base de datos
        $user = User::create([
            'nombre'            => $request->nombre,
            'correo'            => $request->correo,
            'contrasena'        => Hash::make($request->contrasena),
            'rol'               => 'usuario', // O el rol por defecto que manejes
            'estado'            => 'activo',
            'active_session_id' => $tabId,
        ]);

        event(new Registered($user));

        // 4. Iniciamos sesión y regeneramos el token de seguridad
        Auth::login($user, false);
        $request->session()->regenerate();
        session(['last_activity_time' => time()]);

        // 5. Redirección coherente con tu sistema
        return redirect()->route('user.inicio');
    }
}