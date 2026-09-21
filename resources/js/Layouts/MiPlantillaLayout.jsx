import React from 'react';
import { Link } from '@inertiajs/react';

export default function MiPlantillaLayout({ children }) {
    return (
        <div id="page-top">
            {/* Navigation (Tu Navbar de Bootstrap/Grayscale) */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
                <div className="container px-4 px-lg-5">
                    <Link className="navbar-brand" href="/">
                        Mi Proyecto
                    </Link>
                    <div className="collapse navbar-collapse" id="navbarResponsive">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" href={route('login')}>
                                    Iniciar Sesión
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href={route('register')}>
                                    Registrarse
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Contenido dinámico de cada página */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="footer bg-black small text-center text-white-50">
                <div className="container px-4 px-lg-5">
                    Copyright &copy; Mi Proyecto {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    );
}