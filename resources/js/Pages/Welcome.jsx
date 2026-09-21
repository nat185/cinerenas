import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    // Obtenemos el usuario autenticado desde las props compartidas de Inertia/Laravel
    const { auth } = usePage().props;

    return (
        <div id="page-top" className="bg-black text-white">
            {/* AQUÍ CAMBIAMOS EL TÍTULO DE LA PESTAÑA */}
            <Head title="CineReseñas - Inicio" />

            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
                <div className="container px-4 px-lg-5">
                    <Link className="navbar-brand" href="/">CineReseñas</Link>
                    <button 
                        className="navbar-toggler navbar-toggler-right" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarResponsive" 
                        aria-controls="navbarResponsive" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation"
                    >
                        Menu <i className="fas fa-bars"></i>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarResponsive">
                        <ul className="navbar-nav ms-auto align-items-center">
                            {auth && auth.user ? (
                                // Si el usuario YA está logueado
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" href="/dashboard">Dashboard</Link>
                                    </li>
                                    <li className="nav-item ms-lg-3">
                                        <Link 
                                            href="/logout" 
                                            method="post" 
                                            as="button" 
                                            className="btn btn-sm btn-outline-light text-uppercase px-3 py-1" 
                                            style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
                                        >
                                            Cerrar Sesión
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                // Si NO está logueado (Mostramos Iniciar Sesión y Registrarse apuntando a /registro)
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" href="/login">Iniciar Sesión</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" href="/registro">Registrarse</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Masthead / Hero Section de Grayscale */}
            <header className="masthead">
                <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center">
                        <div className="text-center">
                            <h1 className="mx-auto my-0 text-uppercase">CineReseñas</h1>
                            <h2 className="text-white-50 mx-auto mt-2 mb-5">
                                Un sistema moderno impulsado por Laravel y React para explorar y opinar sobre tus películas favoritas.
                            </h2>
                            {!auth?.user && (
                                <Link className="btn btn-primary" href="/login">
                                    Comenzar Ahora
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Footer */}
            <footer className="bg-black text-center py-4 text-white-50">
                <div className="container px-4 px-lg-5">Copyright &copy; Sistema de Reseñas 2026</div>
            </footer>
        </div>
    );
}