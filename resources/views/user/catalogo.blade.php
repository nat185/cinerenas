@extends('layouts.grayscale-layout')

@section('title', 'CineReseñas - Inicio')

@section('content')
    <!-- Masthead / Banner Principal -->
    <header class="masthead d-flex align-items-center">
        <div class="container px-4 px-lg-5 text-center">
            <h1 class="mx-auto my-0 text-uppercase fw-bold text-white" style="letter-spacing: 2px; font-size: clamp(2.5rem, 6vw, 5rem);">CineReseñas</h1>
            <h2 class="text-white-50 mx-auto mt-2 mb-5" style="font-size: 1.25rem;">Tu espacio para descubrir, opinar y compartir las mejores películas.</h2>
            <a class="btn btn-primary text-uppercase px-4 py-2" href="{{ route('login') }}" style="background-color: #64a19d; border: none; border-radius: 0; letter-spacing: 1px;">Explorar Reseñas</a>
        </div>
    </header>

    <!-- Sección About -->
    <section class="about-section text-center bg-black py-5" id="about">
        <div class="container px-4 px-lg-5">
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-lg-8">
                    <h2 class="text-white mb-4">Construido para los verdaderos amantes del cine</h2>
                    <p class="text-white-50">
                        Sumérgete en un catálogo dinámico donde podrás registrar tus películas favoritas, leer opiniones de otros usuarios y calificar cada producción con un sistema moderno y estilizado.
                    </p>
                </div>
            </div>
            <img class="img-fluid rounded shadow-lg mt-4" src="{{ asset('dist/assets/img/ipad.png') }}" alt="Vista previa del sistema" style="max-width: 70%;" />
        </div>
    </section>

    <!-- Sección de Proyectos / Destacados -->
    <section class="projects-section bg-light py-5" id="projects">
        <div class="container px-4 px-lg-5">
            <!-- Proyecto 1 -->
            <div class="row align-items-center gx-0 mb-4 mb-lg-5 bg-black rounded overflow-hidden shadow">
                <div class="col-xl-8 col-lg-7">
                    <img class="img-fluid mb-3 mb-lg-0 w-100" src="{{ asset('dist/assets/img/bg-masthead.jpg') }}" alt="..." style="height: 350px; object-fit: cover;" />
                </div>
                <div class="col-xl-4 col-lg-5 p-4 p-lg-5">
                    <div class="featured-text text-center text-lg-start">
                        <h4 class="text-white">Estrenos y Clásicos</h4>
                        <p class="text-white-50 mb-0">Mantén el control de tus reseñas ordenadas por categorías, géneros y valoraciones de la comunidad.</p>
                    </div>
                </div>
            </div>

            <!-- Proyecto 2 -->
            <div class="row align-items-center gx-0 mb-5 mb-lg-0 bg-dark rounded overflow-hidden shadow">
                <div class="col-xl-4 col-lg-5 order-lg-2 p-4 p-lg-5">
                    <div class="featured-text text-center text-lg-start">
                        <h4 class="text-white">Comunidad Activa</h4>
                        <p class="text-white-50 mb-0">Inicia sesión o regístrate en pocos segundos para empezar a interactuar y publicar tus propias críticas cinematográficas.</p>
                    </div>
                </div>
                <div class="col-xl-8 col-lg-7 order-lg-1">
                    <img class="img-fluid mb-3 mb-lg-0 w-100" src="{{ asset('dist/assets/img/demo-image-2.jpg') }}" alt="..." style="height: 350px; object-fit: cover;" />
                </div>
            </div>
        </div>
    </section>

    <!-- Sección de Llamado a la Acción -->
    <section class="signup-section" id="signup">
        <div class="container px-4 px-lg-5">
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-lg-10 text-center">
                    <i class="far fa-paper-plane fa-2x mb-2 text-white"></i>
                    <h2 class="text-white mb-5">¿Listo para unirte? Crea tu cuenta hoy mismo.</h2>
                    <a href="{{ route('register') }}" class="btn btn-primary text-uppercase px-5 py-3 fw-bold shadow" style="background-color: #64a19d; border: none; border-radius: 0; letter-spacing: 1px;">Registrarse Ahora</a>
                </div>
            </div>
        </div>
    </section>
@endsection