<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>@yield('title', 'Sistema de Películas')</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('dist/assets/favicon.ico') }}" />
    
    <!-- Font Awesome Icons -->
    <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet" />
    
    <!-- Estilos de Grayscale -->
    <link href="{{ asset('dist/css/styles.css') }}" rel="stylesheet" />
</head>
<body id="page-top">

    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
        <div class="container px-4 px-lg-5">
            <a class="navbar-brand" href="{{ url('/') }}">CineReseñas</a>
            <button class="navbar-toggler navbar-toggler-right" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                Menu
                <i class="fas fa-bars"></i>
            </button>
            <div class="collapse navbar-collapse" id="navbarResponsive">
                <ul class="navbar-nav ms-auto align-items-center">
                    @auth
                        <!-- Si el usuario YA está logueado -->
                        <li class="nav-item"><a class="nav-link" href="#">Dashboard</a></li>
                        <li class="nav-item ms-lg-3">
                            <form action="{{ route('logout') }}" method="POST" class="d-inline">
                                @csrf
                                <button type="submit" class="btn btn-sm btn-outline-light text-uppercase px-3 py-1" style="font-size: 0.8rem; letter-spacing: 1px;">
                                    Cerrar Sesión
                                </button>
                            </form>
                        </li>
                    @else
                        <!-- Ocultar solo estos dos botones si estamos en login o register (compatible con XAMPP) -->
                        @unless(request()->is('*login*') || request()->is('*registro*'))
                            <li class="nav-item"><a class="nav-link" href="{{ route('login') }}">Iniciar Sesión</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('register') }}">Registrarse</a></li>
                        @endunless
                    @endauth
                </ul>
            </div>
        </div>
    </nav>

    <!-- CONTENIDO DINÁMICO -->
    <main>
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-black text-center py-4 text-white-50">
        <div class="container px-4 px-lg-5">Copyright &copy; Sistema de Reseñas 2026</div>
    </footer>

    <!-- Bootstrap core JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Core theme JS -->
    <script src="{{ asset('dist/js/scripts.js') }}"></script>
</body>
</html>