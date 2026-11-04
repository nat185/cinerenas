import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const resolvePoster = (path) => {
    if (!path) return '/dist/assets/img/posters/default.jpg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
};

/* Mensaje flotante verde (mismo estilo de las demás páginas) */
export function ToastMensaje({ flash }) {
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
            style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 99999, fontSize: '0.85rem', borderRadius: '6px', maxWidth: '380px' }}
        >
            <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
            <div className="flex-grow-1">{flash?.message || flash?.error}</div>
            <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setVisible(false)}></button>
        </div>
    );
}

/* Cinco estrellas (texto, sin iconos) para puntuar */
function Estrellas({ valor = 0, onChange, deshabilitado = false }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="d-inline-flex align-items-center" role="group" aria-label="Puntuación" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
                const lleno = (hover || valor) >= n;
                return (
                    <button
                        key={n}
                        type="button"
                        disabled={deshabilitado}
                        onClick={() => onChange(n)}
                        onMouseEnter={() => setHover(n)}
                        title={`Puntuar con ${n} estrella${n > 1 ? 's' : ''}`}
                        style={{
                            background: 'none', border: 'none', padding: '0 3px',
                            color: lleno ? '#ffc107' : 'rgba(255,255,255,0.4)',
                            fontSize: '1.55rem', lineHeight: 1,
                            cursor: deshabilitado ? 'wait' : 'pointer',
                            transition: 'transform 0.15s ease, color 0.15s ease',
                            transform: hover === n ? 'scale(1.2)' : 'scale(1)',
                        }}
                    >
                        {lleno ? '★' : '☆'}
                    </button>
                );
            })}
        </div>
    );
}

/* =========================================================================
   Ficha completa de la película (misma información que el modal de Inicio)
========================================================================= */
export default function PeliculaModal({ pelicula, onClose, onToggleFavorito }) {
    const [esVista, setEsVista] = useState(!!pelicula.es_vista);
    const [miValoracion, setMiValoracion] = useState(pelicula.mi_valoracion || 0);
    const [enviandoValoracion, setEnviandoValoracion] = useState(false);
    const [posterAmpliado, setPosterAmpliado] = useState(false);

    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [textoEditado, setTextoEditado] = useState('');

    useEffect(() => { setEsVista(!!pelicula.es_vista); }, [pelicula.id, pelicula.es_vista]);
    useEffect(() => { setMiValoracion(pelicula.mi_valoracion || 0); }, [pelicula.id, pelicula.mi_valoracion]);

    const toggleVista = () => {
        setEsVista(!esVista);
        router.post(route('user.vistas.toggle'), { pelicula_id: pelicula.id }, { preserveScroll: true, preserveState: true });
    };

    const calificar = (puntos) => {
        if (enviandoValoracion) return;
        const anterior = miValoracion;
        setEnviandoValoracion(true);
        setMiValoracion(puntos);
        router.post(
            route('user.valoraciones.store'),
            { pelicula_id: pelicula.id, puntuacion: puntos },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => setMiValoracion(anterior),
                onFinish: () => setEnviandoValoracion(false),
            }
        );
    };

    const enviarComentario = (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim() || enviandoComentario) return;
        setEnviandoComentario(true);
        router.post(
            route('user.comentarios.store'),
            { pelicula_id: pelicula.id, texto: nuevoComentario },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setNuevoComentario(''),
                onFinish: () => setEnviandoComentario(false),
            }
        );
    };

    const actualizarComentario = (id) => {
        if (!textoEditado.trim()) return;
        router.put(
            route('user.comentarios.update', id),
            { texto: textoEditado },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => { setEditandoId(null); setTextoEditado(''); },
            }
        );
    };

    const eliminarComentario = (id) => {
        router.delete(route('user.comentarios.destroy', id), { preserveScroll: true, preserveState: true });
    };

    const plataformas = Array.isArray(pelicula.plataformas) ? pelicula.plataformas : [];

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '20px 16px',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#141414', color: '#fff', borderRadius: '8px',
                    maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                }}
            >
                {posterAmpliado && (
                    <div
                        onClick={() => setPosterAmpliado(false)}
                        style={{
                            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 1100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '8px',
                        }}
                    >
                        <img
                            src={resolvePoster(pelicula.poster)}
                            alt={pelicula.titulo}
                            style={{ maxWidth: '320px', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.9)' }}
                        />
                    </div>
                )}

                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img
                        src={resolvePoster(pelicula.poster)}
                        alt={pelicula.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                        onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                    />
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        style={{
                            position: 'absolute', top: '12px', right: '12px', width: '35px', height: '35px',
                            borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)',
                            color: '#fff', fontSize: '1.1rem', cursor: 'pointer', zIndex: 1050,
                        }}
                        title="Cerrar"
                    >
                        ✕
                    </button>
                    <div className="position-absolute bottom-0 start-0 p-3 w-100" style={{ background: 'linear-gradient(0deg, rgba(20,20,20,0.95) 10%, transparent 100%)' }}>
                        <h2 className="mb-1" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{pelicula.titulo}</h2>
                        <div className="d-flex flex-wrap align-items-center gap-2 text-white-50" style={{ fontSize: '0.8rem' }}>
                            <span>{pelicula.anio || 'N/A'}</span>
                            {pelicula.duracion_min && <span>· {pelicula.duracion_min} min</span>}
                            <span className="badge" style={{ backgroundColor: '#5c8d89' }}>{pelicula.genero}</span>
                            {pelicula.pais && <span>· {pelicula.pais}</span>}
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="row g-3 mb-2 align-items-start">
                        <div className="col-4 col-sm-3">
                            <img
                                src={resolvePoster(pelicula.poster)}
                                alt={pelicula.titulo}
                                className="img-fluid rounded shadow"
                                style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => setPosterAmpliado(true)}
                                title="Clic para ampliar póster"
                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                            />
                        </div>
                        <div className="col-8 col-sm-9">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                                <div>
                                    <div className="text-white-50 mb-1" style={{ fontSize: '0.72rem' }}>Tu puntuación</div>
                                    <Estrellas valor={miValoracion} onChange={calificar} deshabilitado={enviandoValoracion} />
                                    <div className="text-white-50 mt-1" style={{ fontSize: '0.72rem' }}>
                                        Promedio {pelicula.valoracion_promedio ?? 0} ★ · {pelicula.total_valoraciones ?? 0} valoraciones
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleVista}
                                        className="btn btn-sm px-3 py-1"
                                        style={{
                                            backgroundColor: esVista ? '#5c8d89' : 'transparent',
                                            border: `1px solid ${esVista ? '#5c8d89' : 'rgba(255,255,255,0.4)'}`,
                                            color: '#fff', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px',
                                        }}
                                    >
                                        <span className="me-1">{esVista ? '✔' : '👁'}</span>
                                        {esVista ? 'Vista' : 'Marcar vista'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onToggleFavorito(pelicula.id)}
                                        className="btn btn-sm px-3 py-1"
                                        style={{
                                            backgroundColor: pelicula.es_favorito ? '#e63950' : 'transparent',
                                            border: `1px solid ${pelicula.es_favorito ? '#e63950' : 'rgba(255,255,255,0.4)'}`,
                                            color: '#fff', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px',
                                        }}
                                    >
                                        <span className="me-1">{pelicula.es_favorito ? '♥' : '♡'}</span>
                                        {pelicula.es_favorito ? 'Favorita' : 'Favorito'}
                                    </button>
                                </div>
                            </div>

                            {pelicula.director && (
                                <p className="text-white mb-1" style={{ fontSize: '0.82rem' }}>
                                    <strong className="text-white-50">Director:</strong> {pelicula.director}
                                </p>
                            )}
                            {pelicula.elenco && (
                                <p className="text-white mb-1" style={{ fontSize: '0.82rem' }}>
                                    <strong className="text-white-50">Elenco:</strong> {pelicula.elenco}
                                </p>
                            )}
                            {plataformas.length > 0 && (
                                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                    <strong className="text-white-50" style={{ fontSize: '0.82rem' }}>Disponible en:</strong>
                                    {plataformas.map((pl) => (
                                        <span
                                            key={pl}
                                            className="badge rounded-pill"
                                            style={{ backgroundColor: 'rgba(92,141,137,0.25)', color: '#9fd4cf', fontSize: '0.72rem', padding: '5px 10px' }}
                                        >
                                            {pl}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {pelicula.trailer_url && (
                                <div className="mt-2 mb-2">
                                    <a
                                        href={pelicula.trailer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-danger py-1 px-2"
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Ver tráiler oficial
                                    </a>
                                </div>
                            )}
                            <p className="text-white mb-0 mt-2" style={{ fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.95 }}>
                                {pelicula.sinopsis || 'Sin descripción disponible.'}
                            </p>
                        </div>
                    </div>

                    <hr className="border-secondary my-3" />

                    <h5 className="text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>Comentarios de la Comunidad</h5>

                    <form onSubmit={enviarComentario} className="mb-4">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control form-control-sm bg-dark text-white border-secondary"
                                placeholder="Escribe un comentario..."
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                maxLength={1000}
                                style={{ fontSize: '0.85rem', borderRadius: '4px 0 0 4px' }}
                            />
                            <button
                                type="submit"
                                className="btn btn-sm btn-outline-light px-3"
                                disabled={enviandoComentario || !nuevoComentario.trim()}
                                style={{ borderRadius: '0 4px 4px 0' }}
                            >
                                Enviar
                            </button>
                        </div>
                    </form>

                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {pelicula.comentarios && pelicula.comentarios.length > 0 ? (
                            pelicula.comentarios.map((c) => (
                                <div key={c.id} className="p-2 rounded bg-dark border border-secondary" style={{ fontSize: '0.8rem' }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="w-100 pe-3">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="fw-bold text-light">{c.usuario}</span>
                                                <span className="text-white-50" style={{ fontSize: '0.7rem' }}>{c.fecha}</span>
                                            </div>
                                            {editandoId === c.id ? (
                                                <div className="mt-2">
                                                    <textarea
                                                        className="form-control bg-dark text-white border-secondary mb-2"
                                                        value={textoEditado}
                                                        onChange={(e) => setTextoEditado(e.target.value)}
                                                        rows={3}
                                                        maxLength={1000}
                                                        style={{ fontSize: '0.85rem', width: '100%' }}
                                                    ></textarea>
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button type="button" onClick={() => actualizarComentario(c.id)} className="btn btn-sm btn-success px-2 py-1" style={{ fontSize: '0.75rem' }}>Guardar</button>
                                                        <button type="button" onClick={() => { setEditandoId(null); setTextoEditado(''); }} className="btn btn-sm btn-secondary px-2 py-1" style={{ fontSize: '0.75rem' }}>Cancelar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-white-50 mb-0">{c.texto}</p>
                                            )}
                                        </div>

                                        {c.es_mio && editandoId !== c.id && (
                                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                                <button type="button" onClick={() => { setEditandoId(c.id); setTextoEditado(c.texto); }} className="btn btn-sm p-1 border-0 bg-transparent text-white" title="Editar comentario" style={{ fontSize: '0.78rem' }}>Editar</button>
                                                <button type="button" onClick={() => eliminarComentario(c.id)} className="btn btn-sm p-1 border-0 bg-transparent text-white" title="Eliminar comentario" style={{ fontSize: '0.78rem' }}>Quitar</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white-50 text-center mb-0 py-2">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}