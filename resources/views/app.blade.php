<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fuentes oficiales de Grayscale -->
    <link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet" />

    <!-- Font Awesome Icons (Necesario para los íconos de la plantilla) -->
    <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>

    <!-- Hoja de estilo de tu plantilla Bootstrap / Grayscale -->
    <link rel="stylesheet" href="{{ asset('dist/css/styles.css') }}">

    <!-- Scripts de Vite e Inertia React -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
  </head>
  <body id="page-top" class="bg-black text-white">
    @inertia

    <!-- Bootstrap core JS (Vital para que el menú desplegable/hamburguesa funcione en móviles y pantallas) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Scripts de JavaScript de tu plantilla Grayscale -->
    <script src="{{ asset('dist/js/scripts.js') }}"></script>
  </body>
</html>