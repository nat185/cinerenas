import React, { useState, useEffect, useMemo, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

/* Quita acentos y mayúsculas para que la búsqueda sea flexible */
const norm = (s) =>
    (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const resolvePoster = (path) => {
    if (!path) return '/dist/assets/img/posters/default.jpg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
};

// Controles rectangulares sin redondear bordes (borderRadius: '4px')
const control = {
    width: '100%',
    height: '40px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '0 16px',
    fontSize: '0.85rem',
    outline: 'none',
    colorScheme: 'dark',
};

// Listado completo de plataformas
const PLATAFORMAS_DISPONIBLES = [
    'Netflix', 'Max', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 
    'Paramount+', 'MUBI', 'Claro Video', 'Pluto TV', 'Tubi', 'Plex', 'Mercado Play'
];

// Listado completo y ampliado de países para asegurar que aparezcan todos
const PAISES_DISPONIBLES = [
    'México', 'Estados Unidos', 'España', 'Argentina', 'Francia', 
    'Reino Unido', 'Japón', 'Corea del Sur', 'Italia', 'Alemania', 
    'Canadá', 'Brasil', 'Colombia', 'Chile', 'Australia', 'Suecia', 
    'Dinamarca', 'India', 'China', 'Rusia', 'Bélgica', 'Noruega', 
    'Polonia', 'Irlanda', 'Suiza', 'Otro'
];

/* =========================================================================
   Toast de notificaciones flotantes
========================================================================= */
function ToastMensaje({ flash }) {
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
            style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 99999, fontSize: '0.85rem', borderRadius: '4px', maxWidth: '380px' }}
        >
            <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
            <div className="flex-grow-1">{flash?.message || flash?.error}</div>
            <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setVisible(false)}></button>
        </div>
    );
}

/* Cinco estrellas (texto) para puntuar */
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
   Ficha completa de la película (Modal)
========================================================================= */
function PeliculaModal({ pelicula, onClose, onToggleFavorito }) {
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
                                        className="btn btn-sm btn-outline-danger py-1 px-2 d-inline-flex align-items-center gap-1"
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        <i className="fab fa-youtube text-danger"></i> Ver tráiler oficial
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
                                className="btn btn-sm btn-outline-light px-3 d-flex align-items-center justify-content-center"
                                disabled={enviandoComentario || !nuevoComentario.trim()}
                                style={{ borderRadius: '0 4px 4px 0', minWidth: '45px' }}
                                title="Enviar comentario"
                            >
                                <i className="fas fa-paper-plane" style={{ fontSize: '0.85rem' }}></i>
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
                                                        <button 
                                                            type="button" 
                                                            onClick={() => actualizarComentario(c.id)} 
                                                            className="btn btn-sm p-2 d-inline-flex align-items-center justify-content-center text-white border-0" 
                                                            style={{ backgroundColor: '#2a9d8f', borderRadius: '4px', width: '32px', height: '32px' }}
                                                            title="Guardar"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => { setEditandoId(null); setTextoEditado(''); }} 
                                                            className="btn btn-sm p-2 d-inline-flex align-items-center justify-content-center text-white border-0" 
                                                            style={{ backgroundColor: '#7b2cbf', borderRadius: '4px', width: '32px', height: '32px' }}
                                                            title="Cancelar"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-white-50 mb-0">{c.texto}</p>
                                            )}
                                        </div>

                                        {/* Botones de Editar (Lápiz) y Quitar (Papelera) idénticos al estilo requerido */}
                                        {c.es_mio && editandoId !== c.id && (
                                            <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => { setEditandoId(c.id); setTextoEditado(c.texto); }}
                                                    className="btn btn-sm p-2 border-0 bg-transparent text-white"
                                                    title="Editar comentario"
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarComentario(c.id)}
                                                    className="btn btn-sm p-2 border-0 bg-transparent text-white"
                                                    title="Eliminar comentario"
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
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

/* =========================================================================
   Componente Principal: Catálogo
========================================================================= */
export default function Catalogo({
    auth,
    peliculas = [],
    generos = [],
    paises = [],
    plataformas = [],
    anioMin = 1888,
    anioMax = new Date().getFullYear(),
}) {
    const { flash } = usePage().props;

    const [q, setQ] = useState('');
    const [generoId, setGeneroId] = useState('');
    const [anio, setAnio] = useState('');
    const [duracion, setDuracion] = useState('');
    const [pais, setPais] = useState('');
    const [plataformasSel, setPlataformasSel] = useState([]);
    const [panelPlataformas, setPanelPlataformas] = useState(false);

    const [abiertaId, setAbiertaId] = useState(null);
    const [favOverride, setFavOverride] = useState({});

    const panelRef = useRef(null);

    useEffect(() => { setFavOverride({}); }, [peliculas]);

    useEffect(() => {
        const cerrar = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setPanelPlataformas(false);
        };
        document.addEventListener('mousedown', cerrar);
        return () => document.removeEventListener('mousedown', cerrar);
    }, []);

    const lista = useMemo(
        () => peliculas.map((p) => (p.id in favOverride ? { ...p, es_favorito: favOverride[p.id] } : p)),
        [peliculas, favOverride]
    );

    const aniosDisponibles = useMemo(() => {
        const out = [];
        for (let a = anioMax; a >= anioMin; a--) out.push(a);
        return out;
    }, [anioMin, anioMax]);

    const anioInvalido = anio.length === 4 && (Number(anio) < anioMin || Number(anio) > anioMax);

    // Listado completo y ampliado de países por defecto garantizado
    const listaPaises = paises.length > 0 ? Array.from(new Set([...paises, ...PAISES_DISPONIBLES])) : PAISES_DISPONIBLES;

    const filtradas = useMemo(() => {
        const texto = norm(q);
        const duracionMax = duracion ? parseInt(duracion, 10) : 0;

        return lista.filter((p) => {
            if (texto) {
                const campos = [p.titulo, p.autor, p.director, p.elenco].map(norm).join(' | ');
                if (!campos.includes(texto)) return false;
            }
            if (generoId && String(p.genero_id) !== String(generoId)) return false;
            if (anio.length === 4 && !anioInvalido && Number(p.anio) !== Number(anio)) return false;
            if (duracionMax > 0 && !(Number(p.duracion_min) > 0 && Number(p.duracion_min) <= duracionMax)) return false;
            if (pais && norm(p.pais) !== norm(pais)) return false;
            if (plataformasSel.length > 0) {
                const suyas = Array.isArray(p.plataformas) ? p.plataformas : [];
                if (!plataformasSel.some((s) => suyas.includes(s))) return false;
            }
            return true;
        });
    }, [lista, q, generoId, anio, anioInvalido, duracion, pais, plataformasSel]);

    const hayFiltros = q || generoId || anio || duracion || pais || plataformasSel.length > 0;

    const limpiar = () => {
        setQ(''); setGeneroId(''); setAnio(''); setDuracion(''); setPais(''); setPlataformasSel([]);
    };

    const alternarPlataforma = (nombre) => {
        setPlataformasSel((prev) => (prev.includes(nombre) ? prev.filter((x) => x !== nombre) : [...prev, nombre]));
    };

    const toggleFavorito = (id) => {
        const actual = lista.find((p) => p.id === id);
        if (!actual) return;
        setFavOverride((prev) => ({ ...prev, [id]: !actual.es_favorito }));
        router.post(route('user.favoritos.toggle', id), {}, { preserveScroll: true, preserveState: true });
    };

    const abierta = abiertaId ? lista.find((p) => p.id === abiertaId) : null;

    return (
        <AuthenticatedLayout auth={auth} title="Catálogo">
            <Head title="Catálogo" />
            <ToastMensaje flash={flash} />

            <style>{`
                @keyframes tarjetaEntrada {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .tarjeta-pelicula {
                    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
                    animation: tarjetaEntrada 0.5s ease both;
                }
                .tarjeta-pelicula:hover {
                    transform: translateY(-8px) scale(1.04);
                    box-shadow: 0 18px 34px rgba(0,0,0,0.55);
                    z-index: 5;
                }
                .filtro-control::placeholder { color: rgba(255,255,255,0.45); }
                .filtro-control:focus { border-color: #5c8d89 !important; }
            `}</style>

            {/* Banner superior con difuminado integrado hacia la sección inferior */}
            <section
                style={{
                    position: 'relative', minHeight: '260px', paddingTop: '70px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 40%',
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,10,0.4) 0%, rgba(8,8,10,0.85) 75%, #08080a 100%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                    <h1 className="text-white mb-2" style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
                        Catálogo
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '640px' }}>
                        Todo el catálogo de CineReseñas. Busca por título, autor, director o elenco y filtra por año, género, duración, país o plataforma.
                    </p>
                </div>
            </section>

            {/* Sección de filtros y listado con tono de fondo más claro (#08080a) */}
            <section style={{ backgroundColor: '#08080a', paddingTop: '24px', paddingBottom: '70px', minHeight: '60vh' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Barra de búsqueda y Botón de Limpiar filtros al lado con texto centrado */}
                    <div className="mb-3 d-flex gap-2 align-items-center">
                        <input
                            type="text"
                            className="filtro-control flex-grow-1"
                            style={control}
                            placeholder="Buscar por título, autor, director o elenco..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            maxLength={150}
                        />
                        <button
                            type="button"
                            className="btn btn-outline-light px-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{ height: '40px', borderRadius: '4px', fontSize: '0.85rem', opacity: hayFiltros ? 1 : 0.5 }}
                            onClick={limpiar}
                            disabled={!hayFiltros}
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    {/* Filtros rectangulares con bordes cuadrados (borderRadius: '4px') */}
                    <div
                        className="mb-3"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}
                    >
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                list="lista-anios"
                                className="filtro-control"
                                style={{ ...control, borderColor: anioInvalido ? '#e63950' : '#333' }}
                                placeholder={`Año (${anioMin}-${anioMax})`}
                                value={anio}
                                maxLength={4}
                                onChange={(e) => setAnio(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                title="Solo números enteros de 4 dígitos"
                            />
                            <datalist id="lista-anios">
                                {aniosDisponibles.map((a) => <option key={a} value={a} />)}
                            </datalist>
                            {anioInvalido && (
                                <div className="mt-1" style={{ color: '#e63950', fontSize: '0.75rem' }}>
                                    El año debe estar entre {anioMin} y {anioMax}.
                                </div>
                            )}
                        </div>

                        <select className="filtro-control" style={control} value={generoId} onChange={(e) => setGeneroId(e.target.value)}>
                            <option value="">Todos los géneros</option>
                            {generos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                        </select>

                        <input
                            type="text"
                            inputMode="numeric"
                            className="filtro-control"
                            style={control}
                            placeholder="Duración máx. (min)"
                            value={duracion}
                            maxLength={3}
                            onChange={(e) => setDuracion(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            title="Minutos, solo números enteros positivos (máximo 3 dígitos)"
                        />

                        {/* Selector de Países ampliado con la lista completa */}
                        <select className="filtro-control" style={control} value={pais} onChange={(e) => setPais(e.target.value)}>
                            <option value="">Todos los países</option>
                            {listaPaises.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>

                        {/* Plataformas de streaming con el listado completo configurado */}
                        <div ref={panelRef} style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="filtro-control"
                                style={{ ...control, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                onClick={() => setPanelPlataformas((v) => !v)}
                            >
                                <span className="text-truncate">
                                    {plataformasSel.length === 0
                                        ? 'Plataformas de streaming'
                                        : `Plataformas (${plataformasSel.length})`}
                                </span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
                            </button>
                            {panelPlataformas && (
                                <div
                                    style={{
                                        position: 'absolute', top: '44px', left: 0, right: 0, minWidth: '220px', zIndex: 60,
                                        backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px',
                                        padding: '8px 12px', maxHeight: '260px', overflowY: 'auto',
                                        boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    {PLATAFORMAS_DISPONIBLES.map((pl) => (
                                        <label key={pl} className="d-flex align-items-center gap-2 py-1 text-white" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={plataformasSel.includes(pl)}
                                                onChange={() => alternarPlataforma(pl)}
                                            />
                                            {pl}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>
                        {filtradas.length} de {lista.length} películas
                    </div>

                    {/* Resultados de películas */}
                    {filtradas.length > 0 ? (
                        <div className="row g-4">
                            {filtradas.map((p, idx) => (
                                <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={p.id}>
                                    <div
                                        className="tarjeta-pelicula position-relative rounded overflow-hidden"
                                        style={{ cursor: 'pointer', backgroundColor: '#141414', animationDelay: `${Math.min(idx, 12) * 0.04}s` }}
                                        onClick={() => setAbiertaId(p.id)}
                                    >
                                        <img
                                            src={resolvePoster(p.poster)}
                                            alt={p.titulo}
                                            style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleFavorito(p.id); }}
                                            title={p.es_favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                            style={{
                                                position: 'absolute', top: '6px', right: '6px',
                                                background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                                                width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', zIndex: 3,
                                            }}
                                        >
                                            <span style={{ color: p.es_favorito ? '#e63950' : '#ffffff', fontSize: '1.05rem', lineHeight: 1 }}>
                                                {p.es_favorito ? '♥' : '♡'}
                                            </span>
                                        </button>
                                        <div
                                            className="position-absolute bottom-0 start-0 w-100 p-2"
                                            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 10%, transparent 100%)' }}
                                        >
                                            <div className="text-white fw-semibold" style={{ fontSize: '0.78rem', lineHeight: '1.2' }}>{p.titulo}</div>
                                            <div className="text-warning" style={{ fontSize: '0.72rem' }}>
                                                ★ {p.valoracion_promedio ?? 0} · {p.anio || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            No se encontraron películas con esos filtros.
                        </div>
                    )}
                </div>
            </section>

            {abierta && (
                <PeliculaModal
                    pelicula={abierta}
                    onClose={() => setAbiertaId(null)}
                    onToggleFavorito={toggleFavorito}
                />
            )}
        </AuthenticatedLayout>
    );
}