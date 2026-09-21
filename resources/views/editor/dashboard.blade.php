@extends('layouts.grayscale-layout')

@section('title', 'Panel de Editor')

@section('content')
    <header class="masthead" style="min-height: 100vh; display: flex; align-items: center; padding-top: 6rem;">
        <div class="container px-4 px-lg-5">
            
            <!-- Título Principal Flotando sobre el Paisaje -->
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-lg-10 text-center mb-5">
                    <h1 class="mx-auto my-0 text-uppercase" style="letter-spacing: 2px;">Panel de Editor</h1>
                    <h2 class="text-white-50 mx-auto mt-2 mb-0" style="font-size: 1.1rem; font-weight: 300;">Gestión de Contenido</h2>
                </div>
            </div>

            <div class="row gx-4 gx-lg-5">
                <!-- Barra Lateral Izquierda -->
                <div class="col-lg-3 mb-4 mb-lg-0">
                    <div class="card bg-black text-white border border-secondary shadow p-4 h-100">
                        <h3 class="h4 text-uppercase fw-bold text-white mb-4" style="letter-spacing: 1px;">Editor Panel</h3>
                        
                        <div class="nav flex-column nav-pills gap-2 mb-auto">
                            <a href="#" class="nav-link active text-white py-2" style="background-color: #64a19d;">Dashboard</a>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Redactar Reseña</a>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Mis Artículos</a>
                            <a href="#" class="nav-link text-white-50 py-2 hover-white">Comentarios</a>
                        </div>
                    </div>
                </div>

                <!-- Contenido Principal -->
                <div class="col-lg-9">
                    <div class="card bg-black text-white border border-secondary shadow p-4 p-md-5 h-100">
                        <p class="text-white-50 mb-1">Bienvenido de nuevo, <strong class="text-white">{{ auth()->user()->name ?? 'Editor' }}</strong>.</p>
                        <p class="text-muted mb-4">Aquí puedes redactar, editar y moderar las reseñas.</p>
                        
                        <div class="row g-4 mt-2">
                            <div class="col-md-6">
                                <div class="card bg-dark text-white border border-secondary p-4 h-100 shadow-sm">
                                    <h3 class="h5 text-warning mb-2">Mis Reseñas</h3>
                                    <p class="fs-3 fw-bold text-white mb-1">12</p>
                                    <span class="text-muted small">Artículos publicados</span>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card bg-dark text-white border border-secondary p-4 h-100 shadow-sm">
                                    <h3 class="h5 text-warning mb-2">Borradores</h3>
                                    <p class="fs-3 fw-bold text-white mb-1">3</p>
                                    <span class="text-muted small">Pendientes de revisión</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </header>
@endsection