import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function UserDashboard({ auth }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AuthenticatedLayout auth={auth} title="Catálogo de Películas">
            
            {/* BOTÓN FLOTANTE PARA DESPLEGAR EL MENÚ LATERAL EN MÓVIL */}
            <button 
                className="btn position-fixed top-50 start-0 translate-middle-y z-3 rounded-end shadow-lg d-lg-none font-monospace"
                style={{ backgroundColor: '#64ffda', color: '#000' }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <i className="fas fa-bars"></i>
            </button>

            {/* SECCIÓN 1: Masthead principal */}
            <header className="masthead">
                <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="text-center">
                        <h1 className="mx-auto my-0 text-uppercase font-monospace">
                            Catálogo de Películas
                        </h1>
                        <h2 className="text-white-50 mx-auto mt-2 mb-4 font-monospace">
                            Explora las reseñas y comparte tu opinión sobre tus títulos favoritos.
                        </h2>
                        <a className="btn btn-primary text-uppercase font-monospace px-4 py-2 mt-3" href="#user-content">
                            Explorar Contenido
                        </a>
                    </div>
                </div>
            </header>

            {/* SECCIÓN 2: Menú lateral desplegable pegado a la izquierda + Estadísticas y Catálogo */}
            <section className="about-section text-center bg-black py-5" id="user-content">
                <div className="container-fluid px-4 px-lg-5">
                    
                    <div className="row gx-4 gx-lg-5">
                        
                        {/* BARRA DE OPCIONES LATERAL IZQUIERDA */}
                        <div className={`col-lg-3 mb-4 mb-lg-0 ${sidebarOpen ? 'd-block' : 'd-none d-lg-block'}`}>
                            <div className="card bg-black text-white shadow p-4 rounded-3 h-100 sticky-top" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', top: '100px', boxShadow: '0 0 15px rgba(100, 255, 218, 0.1)' }}>
                                <div className="card-body text-start d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'rgba(100, 255, 218, 0.3)' }}>
                                            <h4 className="text-uppercase font-monospace text-white-50 small mb-0 fw-bold">
                                                <i className="fas fa-film me-2" style={{ color: '#64ffda' }}></i> Menú Usuario
                                            </h4>
                                            <button className="btn btn-sm text-white d-lg-none" onClick={() => setSidebarOpen(false)}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <ul className="list-unstyled d-flex flex-column gap-3 mb-0 font-monospace">
                                            <li>
                                                <Link href="#" className="text-white text-decoration-none d-flex align-items-center gap-3 p-2 rounded" style={{ backgroundColor: 'rgba(100, 255, 218, 0.1)', borderLeft: '4px solid #64ffda' }}>
                                                    <i className="fas fa-home" style={{ color: '#64ffda' }}></i> Inicio
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="#movies-catalog" className="text-white-50 text-decoration-none d-flex align-items-center gap-3 p-2 rounded">
                                                    <i className="fas fa-video"></i> Películas
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="#my-reviews" className="text-white-50 text-decoration-none d-flex align-items-center gap-3 p-2 rounded">
                                                    <i className="fas fa-star"></i> Mis Reseñas
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="#favorites" className="text-white-50 text-decoration-none d-flex align-items-center gap-3 p-2 rounded">
                                                    <i className="fas fa-heart"></i> Favoritos
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="text-muted small font-monospace mt-4 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                        Comunidad Activa
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTENIDO PRINCIPAL Y TARJETAS CON EFECTO ESPEJO Y BORDES VERDE AZULADO */}
                        <div className={sidebarOpen ? 'col-lg-9' : 'col-lg-9 mx-auto'}>
                            <div className="row gx-3 gy-3 mb-5">
                                
                                <div className="col-md-4">
                                    <div className="card bg-black text-white py-4 rounded-3 h-100 position-relative overflow-hidden" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)' }}>
                                        <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }}></div>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h6 className="text-uppercase font-monospace text-white-50 small mb-2">Reseñas Escritas</h6>
                                            <h2 className="text-white font-monospace mb-0 fw-bold">14</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card bg-black text-white py-4 rounded-3 h-100 position-relative overflow-hidden" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)' }}>
                                        <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }}></div>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h6 className="text-uppercase font-monospace text-white-50 small mb-2">Películas Vistas</h6>
                                            <h2 className="text-white font-monospace mb-0 fw-bold">52</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card bg-black text-white py-4 rounded-3 h-100 position-relative overflow-hidden" style={{ border: '1px solid rgba(100, 255, 218, 0.4)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)' }}>
                                        <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }}></div>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h6 className="text-uppercase font-monospace text-white-50 small mb-2">Puntuación Media</h6>
                                            <h2 className="text-white font-monospace mb-0 fw-bold">4.8 / 5</h2>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* CATÁLOGO DE PELÍCULAS */}
                            <div id="movies-catalog" className="text-start text-white mb-4">
                                <h3 className="font-monospace text-uppercase text-white border-bottom pb-2 mb-4" style={{ borderColor: 'rgba(100, 255, 218, 0.3)' }}>
                                    Películas Destacadas de la Semana
                                </h3>
                                
                                <div className="row gx-3 gy-4">
                                    <div className="col-md-4">
                                        <div className="card bg-black border border-secondary text-white h-100 shadow">
                                            <img src="/dist/assets/img/demo-image-01.jpg" className="card-img-top object-fit-cover" alt="Película 1" style={{ height: '180px' }} />
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="font-monospace text-uppercase text-warning small fw-bold">El Secreto del Abismo</h5>
                                                <p className="small text-white-50 flex-grow-1 font-monospace">Una aventura cinematográfica de suspenso que desafía los límites de la mente.</p>
                                                <button className="btn btn-outline-light btn-sm font-monospace text-uppercase mt-2">Ver Reseña</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card bg-black border border-secondary text-white h-100 shadow">
                                            <img src="/dist/assets/img/demo-image-02.jpg" className="card-img-top object-fit-cover" alt="Película 2" style={{ height: '180px' }} />
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="font-monospace text-uppercase text-warning small fw-bold">Sombras en la Ciudad</h5>
                                                <p className="small text-white-50 flex-grow-1 font-monospace">Acción y drama urbano con una trama impredecible de principio a fin.</p>
                                                <button className="btn btn-outline-light btn-sm font-monospace text-uppercase mt-2">Ver Reseña</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card bg-black border border-secondary text-white h-100 shadow">
                                            <img src="/dist/assets/img/bg-signup.jpg" className="card-img-top object-fit-cover" alt="Película 3" style={{ height: '180px' }} />
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="font-monospace text-uppercase text-warning small fw-bold">Ecos del Pasado</h5>
                                                <p className="small text-white-50 flex-grow-1 font-monospace">Un drama conmovedor sobre la memoria y las relaciones familiares.</p>
                                                <button className="btn btn-outline-light btn-sm font-monospace text-uppercase mt-2">Ver Reseña</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </section>

            {/* SECCIÓN 3: Proyectos / Reseñas Destacadas (Estilo Grayscale Dual) */}
            <section className="projects-section bg-light py-5 text-dark" id="favorites">
                <div className="container px-4 px-lg-5">
                    <div className="row gx-0 mb-4 mb-lg-5 align-items-center shadow-sm rounded overflow-hidden bg-white">
                        <div className="col-xl-8 col-lg-7 p-0">
                            <img className="img-fluid w-100 h-100 object-fit-cover" src="/dist/assets/img/demo-image-02.jpg" alt="Comunidad CineReseñas" style={{ minHeight: '300px' }} />
                        </div>
                        <div className="col-xl-4 col-lg-5">
                            <div className="featured-text text-center text-lg-start p-4 p-lg-5">
                                <h4 className="text-uppercase fw-bold font-monospace text-dark mb-3">Comparte tu Opinión</h4>
                                <p className="text-muted mb-0 lh-base font-monospace">
                                    Únete a los debates semanales, califica los estrenos más taquilleros y descubre recomendaciones personalizadas basadas en tus géneros favoritos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 4: Boletín informativo */}
            <section className="signup-section bg-black py-5" id="signup">
                <div className="container px-4 px-lg-5">
                    <div className="row gx-4 gx-lg-5 justify-content-center">
                        <div className="col-lg-8 text-center">
                            <i className="far fa-paper-plane fa-2x mb-2 text-white"></i>
                            <h2 className="text-white mb-5 font-monospace text-uppercase" style={{ fontSize: '1.25rem' }}>Suscríbete para recibir los nuevos estrenos</h2>
                            <form className="form-signup d-flex flex-column flex-sm-row justify-content-center gap-2">
                                <input className="form-control flex-fill me-sm-2 mb-3 mb-sm-0 font-monospace" id="inputEmail" type="email" placeholder="Ingresa tu correo electrónico..." />
                                <button className="btn btn-primary font-monospace text-uppercase px-4" type="submit">¡Suscribirse!</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </AuthenticatedLayout>
    );
}