<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register', [
            'status' => session('status'),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'min:6', 'confirmed'],
        ]);

        // Identificador de la pestaña que hizo el registro
        $tabId = $request->header('X-Tab-Session') ?? Str::random(40);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'usuario',
            'active_session_id' => $tabId,
        ]);

        Auth::login($user, false);
        $request->session()->regenerate();
        session(['last_activity_time' => time()]);

        return redirect()->route('user.inicio');
    }

    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Las credenciales no coinciden con nuestros registros.',
            ]);
        }

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // La pestaña que acaba de iniciar sesión pasa a ser "la sesión válida" de este usuario.
        // Cualquier otra pestaña/navegador/dispositivo con un X-Tab-Session distinto quedará invalidado.
        $tabId = $request->header('X-Tab-Session') ?? Str::random(40);
        $user->active_session_id = $tabId;
        $user->save();

        session(['last_activity_time' => time()]);

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'editor') {
            return redirect()->route('editor.dashboard');
        }

        return redirect()->route('user.inicio');
    }

    public function logout(Request $request)
    {
        $reason = $request->input('reason');

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if ($user) {
            $user->active_session_id = null;
            $user->save();
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $mensaje = $reason === 'inactivity'
            ? 'Se cerró tu sesión por inactividad. Vuelve a ingresar.'
            : null;

        return redirect()->route('login')->with('status', $mensaje);
    }
}