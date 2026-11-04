import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

/* =========================================================================
   FlashToast — mensaje flotante de éxito/error, auto-desaparece
========================================================================= */
export function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    if (!visible || (!flash?.message && !flash?.error)) return null;

    return (
        <div
            className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
            style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.85rem', borderRadius: '6px', maxWidth: '380px' }}
        >
            <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
            <div className="flex-grow-1">{flash?.message || flash?.error}</div>
            <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setVisible(false)}></button>
        </div>
    );
}

/* =========================================================================
   Helper de póster compartido (ruta segura, sin romper si falta)
========================================================================= */
function resolvePoster(path) {
    if (!path) return '/dist/assets/img/posters/default.jpg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
}

/* =========================================================================
   PosterImg — póster reutilizable (usado por Peliculas.jsx/Resenas.jsx, etc.)
========================================================================= */
export function PosterImg({ src, alt, width = '100%', height = 'auto', className = '', style = {}, onClick }) {
    return (
        <img
            src={resolvePoster(src)}
            alt={alt || 'Póster'}
            className={className}
            onClick={onClick}
            style={{
                width,
                height,
                objectFit: 'cover',
                objectPosition: 'center 20%',
                borderRadius: '4px',
                cursor: onClick ? 'pointer' : 'default',
                ...style,
            }}
            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
        />
    );
}

/* =========================================================================
   RatingStars — estrellas INTERACTIVAS (clic = valorar la película)
========================================================================= */
export function RatingStars({ pelicula }) {
    const [valorActual, setValorActual] = useState(pelicula.mi_valoracion || 0);
    const [enviando, setEnviando] = useState(false);
    const [hover, setHover] = useState(0);

    const calificar = (puntos) => {
        if (enviando) return;
        const anterior = valorActual;
        setEnviando(true);
        setValorActual(puntos);
        router.post(
            route('user.valoraciones.store'),
            { pelicula_id: pelicula.id, puntuacion: puntos },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => setValorActual(anterior),
                onFinish: () => setEnviando(false),
            }
        );
    };

    return (
        <div>
            <div className="text-white-50 mb-1" style={{ fontSize: '0.72rem' }}>Tu puntuación</div>
            <div className="d-inline-flex align-items-center" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => {
                    const lleno = (hover || valorActual) >= n;
                    return (
                        <button
                            key={n}
                            type="button"
                            disabled={enviando}
                            onClick={() => calificar(n)}
                            onMouseEnter={() => setHover(n)}
                            title={`Puntuar con ${n} estrella${n > 1 ? 's' : ''}`}
                            style={{
                                background: 'none', border: 'none', padding: '0 3px',
                                color: lleno ? '#ffc107' : 'rgba(255,255,255,0.4)',
                                fontSize: '1.55rem', lineHeight: 1,
                                cursor: enviando ? 'wait' : 'pointer',
                                transition: 'transform 0.15s ease, color 0.15s ease',
                                transform: hover === n ? 'scale(1.2)' : 'scale(1)',
                            }}
                        >
                            {lleno ? '★' : '☆'}
                        </button>
                    );
                })}
            </div>
            <div className="text-white-50 mt-1" style={{ fontSize: '0.72rem' }}>
                Promedio {pelicula.valoracion_promedio ?? 0} ★ · {pelicula.total_valoraciones ?? 0} valoraciones
            </div>
        </div>
    );
}

/* =========================================================================
   MovieRow — carrusel horizontal estilo Netflix
========================================================================= */
export function MovieRow({ titulo, peliculas = [], onAbrir }) {
    const rowRef = useRef(null);

    const scroll = (dir) => {
        if (rowRef.current) {
            const amount = rowRef.current.clientWidth * 0.8;
            rowRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
        }
    };

    if (!peliculas.length) return null;

    return (
        <div className="mb-4" style={{ position: 'relative' }}>
            <h3 className="text-white mb-3" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {titulo}
            </h3>

            <button
                onClick={() => scroll('left')}
                className="d-none d-md-flex"
                style={{
                    position: 'absolute', left: '-6px', top: '58%', zIndex: 5, transform: 'translateY(-50%)',
                    width: '34px', height: '34px', borderRadius: '50%', border: 'none',
                    backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <i className="fas fa-chevron-left"></i>
            </button>
            <button
                onClick={() => scroll('right')}
                className="d-none d-md-flex"
                style={{
                    position: 'absolute', right: '-6px', top: '58%', zIndex: 5, transform: 'translateY(-50%)',
                    width: '34px', height: '34px', borderRadius: '50%', border: 'none',
                    backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <i className="fas fa-chevron-right"></i>
            </button>

            <div
                ref={rowRef}
                className="d-flex gap-3 pb-2"
                style={{ overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
            >
                <style>{`.movie-row-hide-scroll::-webkit-scrollbar { display: none; }`}</style>
                {peliculas.map((p, idx) => (
                    <div
                        key={p.id}
                        onClick={() => onAbrir(p)}
                        className="movie-row-card"
                        style={{
                            flex: '0 0 auto',
                            width: '150px',
                            cursor: 'pointer',
                            scrollSnapAlign: 'start',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: '#141414',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            animation: 'filaEntrada 0.5s ease both',
                            animationDelay: `${idx * 0.05}s`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.6)';
                            e.currentTarget.style.zIndex = '4';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1) translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.zIndex = '1';
                        }}
                    >
                        <img
                            src={resolvePoster(p.poster)}
                            alt={p.titulo}
                            style={{
                                width: '100%',
                                aspectRatio: '2 / 3',
                                objectFit: 'cover',
                                objectPosition: 'center 20%',
                                display: 'block',
                            }}
                            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                        />
                        {p.es_favorito && (
                            <i
                                className="fas fa-heart"
                                style={{ position: 'absolute', top: '6px', right: '6px', color: '#e63950', fontSize: '0.85rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                            ></i>
                        )}
                        <div
                            className="position-absolute bottom-0 start-0 w-100 p-2"
                            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 10%, transparent 100%)' }}
                        >
                            <div className="text-white fw-semibold" style={{ fontSize: '0.78rem', lineHeight: '1.2' }}>
                                {p.titulo}
                            </div>
                            <div className="text-warning" style={{ fontSize: '0.72rem' }}>
                                ★ {p.valoracion_promedio ?? 0}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes filaEntrada {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

/* =========================================================================
   MovieModal — detalle de película, sin iframe de tráiler (evita pantalla
   en blanco cuando trailer_url es null), con estrellas reales,
   favoritos, plataformas y comentarios.
========================================================================= */
export function MovieModal({ pelicula, onClose }) {
    const [textoComentario, setTextoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [esFavorito, setEsFavorito] = useState(pelicula.es_favorito);
    const [esVista, setEsVista] = useState(!!pelicula.es_vista);

    if (!pelicula) return null;

    const plataformas = Array.isArray(pelicula.plataformas)
        ? pelicula.plataformas
        : (typeof pelicula.plataformas === 'string' && pelicula.plataformas
            ? pelicula.plataformas.split(',').map((s) => s.trim())
            : []);

    const toggleFavorito = () => {
        setEsFavorito(!esFavorito);
        router.post(route('user.favoritos.toggle', pelicula.id), {}, { preserveScroll: true, preserveState: true });
    };

    const toggleVista = () => {
        setEsVista(!esVista);
        router.post(route('user.vistas.toggle'), { pelicula_id: pelicula.id }, { preserveScroll: true, preserveState: true });
    };

    const enviarComentario = (e) => {
        e.preventDefault();
        if (!textoComentario.trim()) return;
        setEnviandoComentario(true);
        router.post(
            route('user.comentarios.store'),
            { pelicula_id: pelicula.id, texto: textoComentario },
            {
                preserveScroll: true,
                onSuccess: () => setTextoComentario(''),
                onFinish: () => setEnviandoComentario(false),
            }
        );
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                overflowY: 'auto', padding: '40px 16px',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#141414', color: '#fff', borderRadius: '8px',
                    maxWidth: '820px', width: '100%', overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)', animation: 'modalEntrada 0.25s ease both',
                }}
            >
                <style>{`
                    @keyframes modalEntrada {
                        from { opacity: 0; transform: translateY(20px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>

                {/* Backdrop: usamos el póster como imagen de cabecera (sin iframe) */}
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                    <img
                        src={resolvePoster(pelicula.poster)}
                        alt={pelicula.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', filter: 'brightness(0.65)' }}
                        onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                    />
                    <div
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(0deg, #141414 5%, transparent 55%)',
                        }}
                    ></div>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '12px', right: '12px', width: '34px', height: '34px',
                            borderRadius: '50%', border: 'none', backgroundColor: 'rgba(20,20,20,0.85)',
                            color: '#fff', fontSize: '1.1rem', cursor: 'pointer',
                        }}
                        title="Cerrar"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="position-absolute bottom-0 start-0 p-3">
                        <h2 className="mb-1" style={{ fontWeight: 700, fontSize: '1.6rem' }}>{pelicula.titulo}</h2>
                        <div className="d-flex align-items-center gap-2 text-white-50" style={{ fontSize: '0.85rem' }}>
                            <span>{pelicula.anio || 'N/A'}</span>
                            {pelicula.duracion_min && <span>· {pelicula.duracion_min} min</span>}
                            <span className="badge" style={{ backgroundColor: '#5c8d89' }}>{pelicula.genero}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {/* Valoración + favoritos */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                        <RatingStars pelicula={pelicula} />
                        <div className="d-flex flex-wrap gap-2">
                            <button
                                onClick={toggleVista}
                                className="btn btn-sm px-3"
                                style={{
                                    backgroundColor: esVista ? '#5c8d89' : 'transparent',
                                    border: `1px solid ${esVista ? '#5c8d89' : 'rgba(255,255,255,0.4)'}`,
                                    color: '#fff', fontSize: '0.78rem', fontWeight: 600, borderRadius: '4px',
                                }}
                            >
                                <i className={`fas ${esVista ? 'fa-check-circle' : 'fa-eye'} me-2`}></i>
                                {esVista ? 'Vista' : 'Marcar como vista'}
                            </button>
                            <button
                                onClick={toggleFavorito}
                                className="btn btn-sm px-3"
                                style={{
                                    backgroundColor: esFavorito ? '#e63950' : 'transparent',
                                    border: `1px solid ${esFavorito ? '#e63950' : 'rgba(255,255,255,0.4)'}`,
                                    color: '#fff', fontSize: '0.78rem', fontWeight: 600, borderRadius: '4px',
                                }}
                            >
                                <i className={`fa${esFavorito ? 's' : 'r'} fa-heart me-2`}></i>
                                {esFavorito ? 'En tus favoritos' : 'Agregar a favoritos'}
                            </button>
                        </div>
                    </div>

                    {/* Plataformas */}
                    {plataformas.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {plataformas.map((p) => (
                                <span key={p} className="badge rounded-pill" style={{ backgroundColor: 'rgba(92,141,137,0.25)', color: '#9fd4cf', fontSize: '0.72rem', padding: '6px 12px' }}>
                                    {p}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Director / País */}
                    <div className="row g-2 mb-3" style={{ fontSize: '0.85rem' }}>
                        <div className="col-sm-6">
                            <strong className="text-white-50">Director:</strong> {pelicula.director || 'No especificado'}
                        </div>
                        <div className="col-sm-6">
                            <strong className="text-white-50">País:</strong> {pelicula.pais || 'N/A'}
                        </div>
                    </div>

                    {/* Sinopsis */}
                    <p className="text-white-50 fst-italic mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                        "{pelicula.sinopsis || 'Sin descripción disponible.'}"
                    </p>

                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    {/* Comentarios */}
                    <h5 className="mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                        <i className="fas fa-comments me-2 text-white-50"></i>
                        Comentarios {pelicula.comentarios?.length ? `(${pelicula.comentarios.length})` : ''}
                    </h5>

                    <form onSubmit={enviarComentario} className="d-flex gap-2 mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333' }}
                            placeholder="Escribe un comentario..."
                            value={textoComentario}
                            onChange={(e) => setTextoComentario(e.target.value)}
                            maxLength={1000}
                        />
                        <button type="submit" className="btn btn-sm px-3" style={{ backgroundColor: '#5c8d89', color: '#fff' }} disabled={enviandoComentario}>
                            Enviar
                        </button>
                    </form>

                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                        {pelicula.comentarios && pelicula.comentarios.length > 0 ? (
                            pelicula.comentarios.map((c) => (
                                <div key={c.id} className="p-2 rounded" style={{ backgroundColor: '#1f1f1f', fontSize: '0.82rem' }}>
                                    <div className="d-flex justify-content-between">
                                        <strong style={{ color: c.es_mio ? '#5c8d89' : '#fff' }}>{c.usuario}</strong>
                                        <span className="text-white-50" style={{ fontSize: '0.7rem' }}>{c.fecha}</span>
                                    </div>
                                    <div className="text-white-50">{c.texto}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-white-50" style={{ fontSize: '0.82rem' }}>Sé el primero en comentar esta película.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}