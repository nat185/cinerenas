import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { KpiCard, PosterThumb } from '@/Components/AdminWidgets';

export default function EditorDashboard({
    auth,
    stats = {},
    ultimasPeliculas = [],
    resenasPendientes = 0,
    desglosePendientes = { borradores: 0, sinResena: 0 },
}) {
    const safeStats = {
        peliculasPublicadas: stats?.peliculasPublicadas ?? 0,
        resenasCreadas: stats?.resenasCreadas ?? 0,
        comentariosRecibidos: stats?.comentariosRecibidos ?? 0,
        valoracionPromedio: stats?.valoracionPromedio ?? 0,
    };

    return (
        <AuthenticatedLayout auth={auth} title="Panel del Editor">
            <section
                style={{
                    position: 'relative',
                    minHeight: '160px',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%',
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>
                        Panel del Editor
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Bienvenido de nuevo, {auth?.user?.nombre}. Resumen general de tus contenidos y valoraciones recibidas.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 160px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Fila de Tarjetas KPI */}
                    <div className="row gx-3 gy-3 mb-4">
                        <KpiCard label="Películas Publicadas" value={safeStats.peliculasPublicadas} />
                        <KpiCard label="Reseñas Publicadas" value={safeStats.resenasCreadas} />
                        <KpiCard label="Comentarios Recibidos" value={safeStats.comentariosRecibidos} />
                        <KpiCard label="Valoración Promedio Público" value={`★ ${safeStats.valoracionPromedio} / 5`} />
                    </div>

                    <div className="row gx-4 gy-4">
                        {/* Últimas Películas Agregadas */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '4px' }}>
                                <h6 className="font-heading text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                                    <i className="fas fa-film me-2"></i> Mis últimas películas agregadas
                                </h6>
                                {ultimasPeliculas.length > 0 ? (
                                    <div className="d-flex gap-4 flex-wrap align-items-start pt-2">
                                        {ultimasPeliculas.map((p, idx) => (
                                            <div key={idx} className="text-center" style={{ width: '100px' }}>
                                                <div className="shadow-sm rounded overflow-hidden mb-2" style={{ height: '140px' }}>
                                                    <img 
                                                        src={p.poster} 
                                                        alt={p.titulo} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                </div>
                                                <div className="text-dark fw-semibold text-truncate" style={{ fontSize: '0.78rem' }}>
                                                    {p.titulo}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted small mb-0 py-4 text-center">Aún no has registrado ninguna película activa.</p>
                                )}
                            </div>
                        </div>

                        {/* Tarjeta de Reseñas Pendientes */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-between text-center" style={{ borderRadius: '4px' }}>
                                <div>
                                    <h6 className="font-heading text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                                        <i className="fas fa-clock me-2"></i> Reseñas Pendientes
                                    </h6>
                                    <div className="text-dark fw-bold my-2" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
                                        {resenasPendientes}
                                    </div>
                                    <div className="text-muted small mb-3">Acciones pendientes de publicación</div>
                                </div>

                                <div className="border-top pt-3 text-start bg-light rounded p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.82rem' }}>
                                        <span className="text-muted"><i className="fas fa-edit me-1"></i> Borradores guardados:</span>
                                        <strong className="text-dark">{desglosePendientes.borradores}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.82rem' }}>
                                        <span className="text-muted"><i className="fas fa-exclamation-triangle me-1"></i> Películas sin reseña:</span>
                                        <strong className="text-warning">{desglosePendientes.sinResena}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}

