@extends('layouts.grayscale-layout')

@section('title', 'Registro - CineReseñas')

@section('content')
    <header class="masthead" style="min-height: 100vh; display: flex; align-items: center; padding-top: 7rem; padding-bottom: 4rem;">
        <div class="container px-4 px-lg-5">
            
            <!-- Título Flotante -->
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-lg-10 text-center mb-5">
                    <h1 class="mx-auto my-0 text-uppercase fw-bold text-white" style="letter-spacing: 2px; font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.1;">
                        Registro
                    </h1>
                    <h2 class="text-white-50 mx-auto mt-3 mb-0" style="font-size: 1.1rem; font-weight: 300;">Crea una cuenta para unirte a la comunidad</h2>
                </div>
            </div>

            <!-- Recuadro con Estilo Cristal Esmerilado -->
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-md-7 col-lg-6">
                    <div class="card text-white border border-secondary shadow-lg p-4 p-md-5" 
                         style="background-color: rgba(15, 15, 15, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
                        
                        <!-- Mensajes de Error -->
                        @if ($errors->any())
                            <div class="alert alert-danger bg-danger text-white border-0 py-2 small mb-4">
                                <ul class="mb-0 ps-3">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <form method="POST" action="{{ route('register') }}">
                            @csrf

                            <!-- Nombre Completo -->
                            <div class="mb-3">
                                <label for="name" class="form-label text-white-50 small text-uppercase fw-bold">Nombre Completo</label>
                                <input type="text" class="form-control bg-dark text-white border-secondary" id="name" name="name" value="{{ old('name') }}" required autofocus style="border-radius: 0;">
                            </div>

                            <!-- Correo Electrónico -->
                            <div class="mb-3">
                                <label for="email" class="form-label text-white-50 small text-uppercase fw-bold">Correo Electrónico</label>
                                <input type="email" class="form-control bg-dark text-white border-secondary" id="email" name="email" value="{{ old('email') }}" required style="border-radius: 0;">
                            </div>

                            <!-- Contraseña -->
                            <div class="mb-3">
                                <label for="password" class="form-label text-white-50 small text-uppercase fw-bold">Contraseña</label>
                                <input type="password" class="form-control bg-dark text-white border-secondary" id="password" name="password" required style="border-radius: 0;">
                            </div>

                            <!-- Confirmar Contraseña -->
                            <div class="mb-4">
                                <label for="password_confirmation" class="form-label text-white-50 small text-uppercase fw-bold">Confirmar Contraseña</label>
                                <input type="password" class="form-control bg-dark text-white border-secondary" id="password_confirmation" name="password_confirmation" required style="border-radius: 0;">
                            </div>

                            <!-- Botón de Registro -->
                            <div class="d-grid mb-3">
                                <button type="submit" class="btn text-uppercase fw-bold text-white py-2" style="background-color: #64a19d; border-radius: 0; letter-spacing: 1px;">
                                    Registrarse
                                </button>
                            </div>

                            <!-- Enlace a Login -->
                            <div class="text-center mt-4">
                                <p class="text-white-50 small mb-0">¿Ya tienes cuenta? <a href="{{ route('login') }}" class="text-white text-decoration-underline">Inicia sesión aquí</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    </header>
@endsection