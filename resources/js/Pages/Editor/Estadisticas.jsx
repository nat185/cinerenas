import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MiniBarChart, PosterThumb } from '@/Components/AdminWidgets';

const COLORS = {
    accent: '#0d9488', dark: '#334155', muted: '#94a3b8', border: '#cbd5e1',
    bg: '#f8f9fa', bgLight: '#f1f5f9',
};

export default function EditorEstadisticas({
    auth,
    resenasPorSemana = [],
    comentariosPorSemana = [],
    misPeliculas = {},
    masPopular = [],
    generos = [],
}) {
    const [filtroGenero, setFiltroGenero] = useState('');
    const [filtroRango, setFiltroRango] = useState('');
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

    // Filtrado dinámico
    const peliculasFiltradas = masPopular.filter((p) => {
        if (filtroGenero && String(p.genero_id) !== String(filtroGenero)) {
            return false;
        }
        if (filtroRango !== '') {
            const val = Number(p.valoracion || 0);
            const rangoNum = Number(filtroRango);
            if (Math.floor(val) !== rangoNum) return false;
        }
        return true;
    });

    return (
        <AuthenticatedLayout auth={auth} title="Mis Estadísticas">
            {/* Modal de Detalle / Superposición (Cierra al dar clic fuera) */}
            {peliculaSeleccionada && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setPeliculaSeleccionada(null); }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                    }}
                >
                    <div className="card border-0 shadow-lg bg-white overflow-hidden" style={{ width: '100%', maxWidth: '850px', borderRadius: '8px' }}>
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 px-4">
                            <h5 className="mb-0 font-heading" style={{ fontSize: '1.1rem' }}>Detalles de Reseña y Película</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setPeliculaSeleccionada(null)}></button>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4 align-items-center">
                                <div className="col-md-4 text-center">
                                    <img 
                                        src={peliculaSeleccionada.poster} 
                                        alt={peliculaSeleccionada.titulo} 
                                        className="img-fluid rounded shadow-sm"
                                        style={{ maxHeight: '320px', objectFit: 'cover', width: '100%' }}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <h3 className="text-dark font-heading mb-1" style={{ fontWeight: '700' }}>{peliculaSeleccionada.titulo}</h3>
                                    <p className="text-muted small mb-3">
                                        <strong>Género:</strong> {peliculaSeleccionada.genero_nombre} | <strong>Año:</strong> {peliculaSeleccionada.anio} | <strong>Director:</strong> {peliculaSeleccionada.director}
                                    </p>
                                    
                                    {/* Contenedor con barra de desplazamiento interna (Scroll) */}
                                    <div 
                                        className="p-3 bg-light rounded mb-3 border" 
                                        style={{ maxHeight: '250px', overflowY: 'auto' }}
                                    >
                                        <h6 className="text-secondary fw-bold mb-1" style={{ fontSize: '0.85rem' }}>Reseña del Editor: "{peliculaSeleccionada.resena_titulo}"</h6>
                                        <p className="text-dark mb-2" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{peliculaSeleccionada.resena_contenido}</p>
                                        <div className="d-flex justify-content-between align-items-center text-muted small border-top pt-2 mt-2">
                                            <span>Calificación otorgada por ti: <strong>{peliculaSeleccionada.resena_calificacion} ★</strong></span>
                                            <span className="badge bg-teal" style={{ backgroundColor: COLORS.accent }}>Estado: {peliculaSeleccionada.resena_estado}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Valoración promedio del público:</span>
                                        <strong className="text-warning fs-5">★ {peliculaSeleccionada.valoracion} / 5</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section style={{
                position: 'relative', minHeight: '180px', paddingTop: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>Mis Estadísticas</h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Rendimiento de tu contenido: reseñas, comentarios y popularidad.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: COLORS.bg, minHeight: 'calc(100vh - 180px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Gráficos Semanales */}
                    <div className="row gx-4 gy-4 mb-4">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '4px' }}>
                                <h6 className="font-heading text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Reseñas publicadas por semana</h6>
                                <MiniBarChart data={resenasPorSemana} />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '4px' }}>
                                <h6 className="font-heading text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Comentarios recibidos por semana</h6>
                                <MiniBarChart data={comentariosPorSemana} />
                            </div>
                        </div>
                    </div>

                    {/* Sección Inferior Ampliada */}
                    <div className="row gx-4 gy-4">
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '4px' }}>
                                <h6 className="font-heading text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Mis Películas</h6>
                                <div className="d-flex flex-column gap-3 mt-3">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <span className="text-muted" style={{ fontSize: '0.88rem' }}>Total Películas:</span>
                                        <strong className="text-dark" style={{ fontSize: '1.05rem' }}>{misPeliculas.total ?? 0}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <span className="text-muted" style={{ fontSize: '0.88rem' }}>Reseñas Creadas:</span>
                                        <strong className="text-dark" style={{ fontSize: '1.05rem' }}>{misPeliculas.resenas ?? 0}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center pt-1">
                                        <span className="text-muted" style={{ fontSize: '0.88rem' }}>Calificación Promedio:</span>
                                        <strong className="text-warning" style={{ fontSize: '1.15rem' }}>★ {misPeliculas.promedio ?? '0.0'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección Ampliada de Más Populares con Carrusel / Scroll Horizontal */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '4px' }}>
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                                    <h6 className="font-heading text-uppercase text-muted mb-0" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Más populares y valoradas</h6>
                                    <div className="d-flex gap-2">
                                        <select 
                                            className="form-select form-select-sm bg-white border" 
                                            style={{ width: '165px', fontSize: '0.78rem' }} 
                                            value={filtroGenero}
                                            onChange={(e) => setFiltroGenero(e.target.value)}
                                        >
                                            <option value="">Todos los géneros</option>
                                            {generos.map((g) => (
                                                <option key={g.id} value={g.id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                        <select 
                                            className="form-select form-select-sm bg-white border" 
                                            style={{ width: '150px', fontSize: '0.78rem' }} 
                                            value={filtroRango}
                                            onChange={(e) => setFiltroRango(e.target.value)}
                                        >
                                            <option value="">Todos los rangos</option>
                                            <option value="5">5 Estrellas</option>
                                            <option value="4">4 Estrellas</option>
                                            <option value="3">3 Estrellas</option>
                                            <option value="2">2 Estrellas</option>
                                            <option value="1">1 Estrella</option>
                                            <option value="0">0 Estrellas</option>
                                        </select>
                                    </div>
                                </div>

                                {peliculasFiltradas.length > 0 ? (
                                    <div 
                                        className="d-flex gap-4 overflow-auto py-2 px-1" 
                                        style={{ scrollBehavior: 'smooth', whiteSpace: 'nowrap' }}
                                    >
                                        {peliculasFiltradas.map((p, idx) => (
                                            <div 
                                                key={idx} 
                                                className="text-center p-2 rounded transition-hover" 
                                                style={{ width: '120px', flexShrink: 0, cursor: 'pointer' }}
                                                onClick={() => setPeliculaSeleccionada(p)}
                                                title="Haz clic para ver detalles y reseña"
                                            >
                                                <div className="position-relative shadow-sm rounded overflow-hidden mb-2" style={{ height: '160px' }}>
                                                    <img 
                                                        src={p.poster} 
                                                        alt={p.titulo} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="text-dark fw-semibold text-truncate" style={{ fontSize: '0.8rem' }}>{p.titulo}</div>
                                                <div className="small fw-bold" style={{ color: COLORS.accent, fontSize: '0.78rem' }}>★ {p.valoracion}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted small">
                                        No hay películas que coincidan con los filtros seleccionados.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}

