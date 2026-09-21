import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function AdminDashboard({ auth }) {
    return (
        <AuthenticatedLayout auth={auth} title="Panel de Administración">
            
            {/* SECCIÓN 1: Masthead principal */}
            <header className="masthead">
                <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center">
                        <div className="text-center">
                            <h1 className="mx-auto my-0 text-uppercase font-monospace">
                                Panel de Administración
                            </h1>
                            <h2 className="text-white-50 mx-auto mt-2 mb-4">
                                Bienvenido de nuevo, Administrador. Controla y gestiona el flujo de reseñas y usuarios del sistema.
                            </h2>
                            <a className="btn btn-primary text-uppercase font-monospace" href="#admin-content">
                                Ver Estadísticas
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* SECCIÓN 2: Menú lateral extendido y tarjetas de estadísticas */}
            <section className="about-section text-center bg-black py-5" id="admin-content">
                <div className="container px-4 px-lg-5">
                    
                    <div className="row gx-4 gx-lg-5 justify-content-center">
                        
                        {/* Menú de navegación lateral más largo y con borde verde azulado (cyan) */}
                        <div className="col-lg-4 mb-4 mb-lg-0">
                            <div className="card bg-black text-white shadow p-4 rounded-3 h-100" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', boxShadow: '0 0 15px rgba(100, 255, 218, 0.1)' }}>
                                <div className="card-body text-start d-flex flex-column justify-content-between">
                                    <div>
                                        <h4 className="text-uppercase font-monospace text-white-50 mb-4 border-bottom pb-3" style={{ borderColor: 'rgba(100, 255, 218, 0.3) !important' }}>
                                            Admin Panel
                                        </h4>
                                        <ul className="list-unstyled d-flex flex-column gap-4 mb-0 font-monospace">
                                            <li>
                                                <Link href="#" className="text-white text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded transition-all" style={{ backgroundColor: 'rgba(100, 255, 218, 0.1)', borderLeft: '4px solid #64ffda' }}>
                                                    <i className="fas fa-tachometer-alt" style={{ color: '#64ffda' }}></i> Dashboard
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="#" className="text-white-50 text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded hover-effect">
                                                    <i className="fas fa-users"></i> Usuarios
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="#" className="text-white-50 text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded hover-effect">
                                                    <i className="fas fa-film"></i> Películas
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="text-muted small font-monospace mt-4 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                        Sistema Activo
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjetas de estadísticas con bordes verde azulado y efecto espejo */}
                        <div className="col-lg-8">
                            <div className="row gx-3 gy-3 h-100">
                                
                                <div className="col-md-4">
                                    <div className="card bg-black text-white py-4 rounded-3 h-100 position-relative overflow-hidden" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                                        {/* Efecto brillo tipo espejo */}
                                        <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }}></div>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h6 className="text-uppercase font-monospace text-white-50 small mb-2">Usuarios Activos</h6>
                                            <h2 className="text-white font-monospace mb-0 fw-bold fs-3">1,245</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card bg-black text-white py-4 rounded-3 h-100 position-relative overflow-hidden" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                                        {/* Efecto brillo tipo espejo */}
                                        <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }}></div>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h6 className="text-uppercase font-monospace text-white-50 small mb-2">Reseñas Totales</h6>
                                            <h2 className="text-white font-monospace mb-0 fw-bold fs-3">480</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card bg-black text-white py-4 rounded-3 h-100 position-relative overflow-hidden" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                                        {/* Efecto brillo tipo espejo */}
                                        <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }}></div>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h6 className="text-uppercase font-monospace text-white-50 small mb-2">Editores</h6>
                                            <h2 className="text-white font-monospace mb-0 fw-bold fs-3">6</h2>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* SECCIÓN 3: Sección de proyectos Grayscale con la imagen real */}
            <section className="projects-section bg-light py-5" id="projects">
                <div className="container px-4 px-lg-5">
                    
                    <div className="row gx-0 mb-4 mb-lg-5 align-items-center">
                        <div className="col-xl-8 col-lg-7">
                            <img className="img-fluid mb-3 mb-lg-0 rounded shadow" src="/dist/assets/img/demo-image-01.jpg" alt="Gestión de Contenido" />
                        </div>
                        <div className="col-xl-4 col-lg-5">
                            <div className="featured-text text-center text-lg-start p-4">
                                <h4 className="text-uppercase font-monospace">Gestión y Control</h4>
                                <p className="text-black-50 mb-0">
                                    Supervisa de manera eficiente la actividad de la comunidad, aprueba contenido multimedia y mantén el orden general del portal de reseñas de cine.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </AuthenticatedLayout>
    );
}