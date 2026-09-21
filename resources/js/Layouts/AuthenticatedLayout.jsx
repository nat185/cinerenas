import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AuthenticatedLayout({ auth, title, children }) {
    const { post } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const userRole = auth?.user?.role ? auth.user.role.toUpperCase() : 'EDITOR';

    return (
        <div className="bg-black text-white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* TÍTULO DINÁMICO PARA LA PESTAÑA DEL NAVEGADOR */}
            <Head title={title ? `${title} - CineReseñas` : 'CineReseñas'} />

            {/* Estilos dinámicos para que el texto y el botón cambien a oscuro cuando Grayscale active el scroll blanco */}
            <style>{`
                #mainNav.navbar-shrink .dynamic-text {
                    color: #212529 !important;
                }
                #mainNav.navbar-shrink .btn-outline-dynamic {
                    color: #212529 !important;
                    border-color: #212529 !important;
                }
                #mainNav.navbar-shrink .btn-outline-dynamic:hover {
                    color: #fff !important;
                    background-color: #212529 !important;
                    border-color: #212529 !important;
                }
            `}</style>

            {/* Navbar original con la animación de Grayscale */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
                <div className="container px-4 px-lg-5 d-flex justify-content-between align-items-center w-100">
                    
                    {/* Logotipo */}
                    <Link className="navbar-brand text-uppercase fw-bold font-monospace" href="/">
                        CineReseñas
                    </Link>

                    {/* Información del usuario y botón de cerrar sesión */}
                    <div className="d-flex align-items-center gap-3">
                        <span className="small d-none d-md-inline dynamic-text text-white" style={{ opacity: 0.9 }}>
                            Hola, <strong className="dynamic-text text-white">{auth?.user?.name || 'Editor de Reseñas'}</strong> 
                            <span className="badge bg-secondary ms-2 text-uppercase" style={{ fontSize: '0.7rem' }}>{userRole}</span>
                        </span>

                        <form onSubmit={handleLogout} className="m-0">
                            <button 
                                type="submit" 
                                className="btn btn-sm btn-outline-light btn-outline-dynamic text-uppercase px-3 py-1 font-monospace"
                                style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
                            >
                                Cerrar Sesión
                            </button>
                        </form>
                    </div>

                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="flex-grow-1 d-flex flex-column">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer bg-black small text-center text-white-50 py-4 border-top border-secondary">
                <div className="container px-4 px-lg-5">Copyright &copy; CineReseñas 2026</div>
            </footer>
        </div>
    );
}