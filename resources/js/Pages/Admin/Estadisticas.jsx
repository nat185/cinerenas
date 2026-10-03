import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const COLORS = {
    accent: '#0d9488',
    accentDark: '#0f766e',
    dark: '#334155',
    muted: '#94a3b8',
    border: '#cbd5e1',
    bg: '#f8f9fa',
    bgLight: '#f1f5f9',
};

function PosterCardMedia({ poster, tint = COLORS.accent }) {
    if (poster) {
        return (
            <div style={{ height: '150px', overflow: 'hidden', background: '#000' }}>
                <img 
                    src={poster} 
                    alt="Poster" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>
        );
    }
    return (
        <div
            style={{
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${tint} 0%, ${COLORS.dark} 100%)`,
            }}
        >
            <i className="fas fa-film text-white" style={{ fontSize: '1.8rem', opacity: 0.85 }}></i>
        </div>
    );
}

export default function Estadisticas({
    auth,
    peliculasMasComentadas = [],
    peliculasMasValoradas = [],
    peliculasMenosValoradas = [],
    peliculasMasVistas = [],
    tematicasData = [],
}) {
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);
    const [mostrarScrollTop, setMostrarScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setMostrarScrollTop(true);
            } else {
                setMostrarScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Estadísticas">
            <style>{`
                nav.navbar, .navbar {
                    background-color: transparent !important;
                    position: absolute !important;
                    top: 0; left: 0; right: 0;
                    z-index: 1030;
                }
                .btn-nav-custom {
                    font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.8rem;
                    border-radius: 4px; border: 1px solid ${COLORS.border}; color: #475569;
                    background-color: #f8fafc; transition: all 0.2s ease;
                    text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none;
                }
                .btn-nav-custom:hover { background-color: #0f172a; color: #ffffff; border-color: #0f172a; }
                .poster-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    cursor: pointer; background: #ffffff;
                    border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden;
                }
                .poster-card:hover { transform: translateY(-4px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1) !important; }
                .scroll-container { display: flex; overflow-x: auto; gap: 1.1rem; padding: 6px 2px 14px 2px; scroll-behavior: smooth; }
                .scroll-container::-webkit-scrollbar { height: 6px; }
                .scroll-container::-webkit-scrollbar-track { background: ${COLORS.bgLight}; border-radius: 3px; }
                .scroll-container::-webkit-scrollbar-thumb { background-color: ${COLORS.border}; border-radius: 3px; }
               
                .scroll-top-btn {
                    position: fixed;
                    bottom: 25px;
                    right: 25px;
                    background: rgba(15, 23, 42, 0.75);
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .scroll-top-btn:hover {
                    background: rgba(15, 23, 42, 0.95);
                    transform: translateY(-3px);
                }
            `}</style>

            {/* HERO */}
            <section
                style={{
                    position: 'relative', minHeight: '200px', paddingTop: '75px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 45%',
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)',
                    zIndex: 1,
                }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: 600, letterSpacing: '-0.02em' }}>
                        Estadísticas
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Rendimiento del catálogo: qué se comenta, qué se valora, visualizaciones y géneros dominantes.
                    </p>
                </div>
            </section>

            {/* Barra de navegación rápida */}
            <div style={{ background: '#ffffff', borderBottom: `1px solid #e2e8f0`, padding: '0.4rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between">
                    <span className="small text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                        <i className="fas fa-compass me-1" style={{ color: COLORS.accent }}></i> Ir a sección:
                    </span>
                    <div className="d-flex gap-2">
                        <a href="#seccion-peliculas" className="btn-nav-custom">Películas</a>
                        <a href="#seccion-tematicas" className="btn-nav-custom">Temáticas</a>
                    </div>
                </div>
            </div>

            {/* SECCIÓN PRINCIPAL */}
            <section className="py-4" style={{ backgroundColor: COLORS.bg, minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">
                    
                    {/* ===== PELÍCULAS ===== */}
                    <div
                        id="seccion-peliculas"
                        className="card border-0 shadow-sm p-4 mb-4"
                        style={{ borderRadius: '6px', border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${COLORS.accent}` }}
                    >
                        <h4 className="fw-bold mb-4 text-dark" style={{ fontSize: '0.95rem', textTransform: 'uppercase' }}>
                            <i className="fas fa-film me-2" style={{ color: COLORS.accent }}></i>Películas
                        </h4>

                        {/* Más comentadas */}
                        <div className="mb-4">
                            <h6 className="text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-comments me-2" style={{ color: COLORS.accent }}></i>Más comentadas
                            </h6>
                            <div className="scroll-container">
                                {peliculasMasComentadas.length > 0 ? peliculasMasComentadas.map((p) => (
                                    <div key={p.id} style={{ minWidth: '190px', width: '190px', flex: '0 0 auto' }}>
                                        <div className="card poster-card shadow-sm h-100" onClick={() => setPeliculaSeleccionada(p)}>
                                            <PosterCardMedia poster={p.poster} tint={COLORS.accent} />
                                            <div className="card-body p-2 px-3 bg-white">
                                                <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.8rem' }}>{p.titulo}</h6>
                                                <div className="d-flex justify-content-between align-items-center mt-1">
                                                    <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: COLORS.dark, color: '#fff' }}>{p.valoracion}</span>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{p.comentarios} coms</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted small">No hay películas registradas.</p>}
                            </div>
                        </div>

                        {/* Más valoradas */}
                        <div className="mb-4">
                            <h6 className="text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-star me-2" style={{ color: COLORS.accent }}></i>Más valoradas
                            </h6>
                            <div className="scroll-container">
                                {peliculasMasValoradas.length > 0 ? peliculasMasValoradas.map((p) => (
                                    <div key={p.id} style={{ minWidth: '190px', width: '190px', flex: '0 0 auto' }}>
                                        <div className="card poster-card shadow-sm h-100" onClick={() => setPeliculaSeleccionada(p)}>
                                            <PosterCardMedia poster={p.poster} tint={COLORS.accentDark} />
                                            <div className="card-body p-2 px-3 bg-white">
                                                <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.8rem' }}>{p.titulo}</h6>
                                                <div className="d-flex justify-content-between align-items-center mt-1">
                                                    <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: COLORS.accent, color: '#fff' }}>{p.valoracion}</span>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{p.comentarios} coms</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted small">No hay películas registradas.</p>}
                            </div>
                        </div>

                        {/* Menos valoradas */}
                        <div className="mb-4">
                            <h6 className="text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-arrow-alt-circle-down me-2 text-danger"></i>Menos valoradas
                            </h6>
                            <div className="card border-0" style={{ backgroundColor: COLORS.bgLight, borderRadius: '6px' }}>
                                <ul className="list-group list-group-flush">
                                    {peliculasMenosValoradas.length > 0 ? peliculasMenosValoradas.map((p, i) => (
                                        <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-dark" style={{ fontSize: '0.85rem', borderColor: COLORS.border }}>
                                            <span><span className="text-muted me-2">#{i + 1}</span>{p.titulo}</span>
                                            <span>
                                                <span className="badge bg-danger me-2">{p.valoracion}</span>
                                                <small className="text-muted">{p.comentarios} coms</small>
                                            </span>
                                        </li>
                                    )) : <li className="list-group-item bg-transparent text-muted small">Sin registros suficientes.</li>}
                                </ul>
                            </div>
                        </div>

                        {/* Más vistas */}
                        <div>
                            <h6 className="text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-eye me-2" style={{ color: COLORS.accent }}></i>Más vistas / Guardadas
                            </h6>
                            <div className="scroll-container">
                                {peliculasMasVistas.length > 0 ? peliculasMasVistas.map((p) => (
                                    <div key={p.id} style={{ minWidth: '190px', width: '190px', flex: '0 0 auto' }}>
                                        <div className="card poster-card shadow-sm h-100" onClick={() => setPeliculaSeleccionada(p)}>
                                            <PosterCardMedia poster={p.poster} tint={COLORS.muted} />
                                            <div className="card-body p-2 px-3 bg-white">
                                                <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.8rem' }}>{p.titulo}</h6>
                                                <div className="d-flex justify-content-between align-items-center mt-1">
                                                    <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: COLORS.dark, color: '#fff' }}>{p.vistas} vistas</span>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{p.valoracion}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted small">No hay películas registradas.</p>}
                            </div>
                        </div>
                    </div>

                    {/* ===== TEMÁTICAS (GÉNEROS) ===== */}
                    <div
                        id="seccion-tematicas"
                        className="card border-0 shadow-sm p-4"
                        style={{ borderRadius: '6px', border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${COLORS.accent}` }}
                    >
                        <h4 className="fw-bold mb-4 text-dark" style={{ fontSize: '0.95rem', textTransform: 'uppercase' }}>
                            <i className="fas fa-tags me-2" style={{ color: COLORS.accent }}></i>Temáticas y Géneros Registrados
                        </h4>
                        <div className="row align-items-center g-4">
                            <div className="col-lg-7">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-dark" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Género</th>
                                                <th className="text-center">Total Películas</th>
                                                <th>Película Destacada</th>
                                                <th className="text-end">Calificación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tematicasData.length > 0 ? tematicasData.map((t, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold text-dark">{t.label}</td>
                                                    <td className="text-center"><span className="badge bg-secondary">{t.value}</span></td>
                                                    <td className="text-dark">{t.mejor_pelicula}</td>
                                                    <td className="text-end fw-semibold text-success">{t.calificacion_mp}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-3">No hay géneros vinculados en la base de datos.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-lg-5 text-center">
                                <div className="p-4 bg-light rounded border">
                                    <i className="fas fa-chart-pie fa-3x mb-2 text-secondary opacity-50"></i>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                        Análisis dinámico de películas agrupadas por género y su obra mejor valorada por los usuarios.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* MODAL DE DETALLE DE PELÍCULA */}
            {peliculaSeleccionada && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow bg-white text-dark" style={{ borderRadius: '6px' }}>
                            <div className="modal-header bg-light py-2">
                                <h5 className="modal-title fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                    <i className="fas fa-film me-2 text-secondary"></i>{peliculaSeleccionada.titulo}
                                </h5>
                                <button type="button" className="btn-close" style={{ fontSize: '0.7rem' }} onClick={() => setPeliculaSeleccionada(null)}></button>
                            </div>
                            <div className="modal-body p-4 text-dark" style={{ fontSize: '0.85rem' }}>
                                {peliculaSeleccionada.poster && (
                                    <div className="text-center mb-3">
                                        <img src={peliculaSeleccionada.poster} alt="Poster" style={{ maxHeight: '140px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </div>
                                )}
                                <p className="mb-2"><strong>Año de Estreno:</strong> <span className="text-dark">{peliculaSeleccionada.estreno}</span></p>
                                <p className="mb-2"><strong>Valoración General:</strong> <span className="badge bg-success">{peliculaSeleccionada.valoracion}</span></p>
                                <p className="mb-2"><strong>Editor Responsable:</strong> <span className="text-dark">{peliculaSeleccionada.editor}</span></p>
                                <p className="mb-3"><strong>Sinopsis:</strong> <span className="text-dark">{peliculaSeleccionada.reseña}</span></p>
                            </div>
                            <div className="modal-footer bg-light py-2">
                                <button type="button" className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.8rem' }} onClick={() => setPeliculaSeleccionada(null)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTÓN FLOTANTE PARA SUBIR */}
            {mostrarScrollTop && (
                <button className="scroll-top-btn" onClick={scrollToTop} title="Volver arriba">
                    <i className="fas fa-chevron-up"></i>
                </button>
            )}
        </AuthenticatedLayout>
    );
}

