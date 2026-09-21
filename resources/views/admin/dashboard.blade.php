@extends('layouts.grayscale-layout')

@section('title', 'Panel de Administración')

@section('content')
    <header class="masthead" style="min-height: 100vh; display: flex; align-items: center; padding-top: 6rem;">
        <div class="container px-4 px-lg-5">
            
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-lg-10 text-center mb-5">
                    <h1 class="mx-auto my-0 text-uppercase" style="letter-spacing: 2px;">Panel de Administración</h1>
                </div>
            </div>

            <div class="row gx-4 gx-lg-5">
                <!-- Barra Lateral con Opciones Compartidas y de Rol -->
                <div class="col-lg-3 mb-4 mb-lg-0">
                    <div class="card bg-black text-white border border-secondary shadow p-4 h-100">
                        <h3 class="h4 text-uppercase fw-bold text-white mb-4" style="letter-spacing: 1px;">Admin Panel</h3>
                        
                        <div class="nav flex-column nav-pills gap-2 mb-auto">
                            <a href="#" class="nav-link active text-white py-2" style="background-color: #64a19d;">Dashboard</a>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Usuarios</a>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Películas</a>
                            
                            <hr class="border-secondary my-2">
                            <span class="text-muted small text-uppercase fw-bold px-2 mb-1">General</span>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Mi Cuenta</a>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Actividad Reciente</a>
                        </div>
                    </div>
                </div>

                <!-- Contenido Principal -->
                <div class="col-lg-9">
                    <div class="card bg-black text-white border border-secondary shadow p-4 p-md-5 h-100">
                        <p class="text-white-50 mb-1">Bienvenido de nuevo, <strong class="text-white">{{ auth()->user()->name ?? 'Administrador' }}</strong>.</p>
                        <p class="text-muted mb-4">Aquí puedes gestionar todo el sistema de reseñas de películas y series.</p>
                        
                        <div class="row g-4 mt-2">
                            <div class="col-md-4">
                                <div class="card bg-dark text-white border border-secondary p-4 h-100 shadow-sm">
                                    <h3 class="h5 text-warning mb-2">Usuarios Activos</h3>
                                    <p class="fs-3 fw-bold text-white mb-1">1,245</p>
                                    <span class="text-muted small">Registrados en el sistema</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-dark text-white border border-secondary p-4 h-100 shadow-sm">
                                    <h3 class="h5 text-warning mb-2">Reseñas Totales</h3>
                                    <p class="fs-3 fw-bold text-white mb-1">480</p>
                                    <span class="text-muted small">Películas evaluadas</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-dark text-white border border-secondary p-4 h-100 shadow-sm">
                                    <h3 class="h5 text-warning mb-2">Editores</h3>
                                    <p class="fs-3 fw-bold text-white mb-1">6</p>
                                    <span class="text-muted small">Activos creando contenido</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </header>
@endsection