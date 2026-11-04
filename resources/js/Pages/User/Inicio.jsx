import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

/* =========================================================================
   FlashToast local (mismo estilo verde de las demás páginas), así esta página
   no depende de lo que exporte UserWidgets.jsx
========================================================================= */
function FlashToast({ flash }) {
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

/* =========================================================================
   Puntuador: botones 1-5 (sin iconos, así no depende de Font Awesome)
========================================================================= */
function Puntuador({ valor = 0, onChange, deshabilitado = false, pequeno = false }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="d-inline-flex align-items-center" role="group" aria-label="Puntuación de 1 a 5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
                const lleno = (hover || valor) >= n;
                return (
                    <button
                        key={n}
                        type="button"
                        disabled={deshabilitado}
                        onClick={(e) => { e.stopPropagation(); onChange(n); }}
                        onMouseEnter={() => setHover(n)}
                        title={`Puntuar con ${n} estrella${n > 1 ? 's' : ''}`}
                        style={{
                            background: 'none', border: 'none', padding: pequeno ? '0 2px' : '0 3px',
                            color: lleno ? '#ffc107' : 'rgba(255,255,255,0.4)',
                            fontSize: pequeno ? '1.15rem' : '1.55rem', lineHeight: 1,
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

function RatingStarsResena({ resena }) {
    const [valorActual, setValorActual] = useState(resena.mi_valoracion || 0);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        setValorActual(resena.mi_valoracion || 0);
    }, [resena.mi_valoracion]);

    const calificar = (puntos) => {
        if (enviando) return;
        const anterior = valorActual;
        setEnviando(true);
        setValorActual(puntos);

        router.post(
            route('user.resenas.valorar'),
            { resena_id: resena.id, puntuacion: puntos },
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
            <Puntuador valor={valorActual} onChange={calificar} deshabilitado={enviando} pequeno />
            <div className="text-white-50 mt-1" style={{ fontSize: '0.72rem' }}>
                Promedio {resena.valoracion_promedio ?? 0} ★ · {resena.total_valoraciones ?? 0} valoraciones
            </div>
        </div>
    );
}

export default function Inicio({ auth, mejorValoradas = [], nuevas = [], recomendadas = [], resenasMejorValoradas = [], generos = [], filtros = {} }) {
    const { flash } = usePage().props;

    const [listMejorValoradas, setListMejorValoradas] = useState(mejorValoradas);
    const [listNuevas, setListNuevas] = useState(nuevas);
    const [listRecomendadas, setListRecomendadas] = useState(recomendadas);
    const [peliculaAbierta, setPeliculaAbierta] = useState(null);
    const [posterAmpliado, setPosterAmpliado] = useState(false);
    const [selectedGenero, setSelectedGenero] = useState(filtros.genero_id || '');

    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [textoEditado, setTextoEditado] = useState('');
    const [enviandoValoracion, setEnviandoValoracion] = useState(false);

    useEffect(() => {
        setListMejorValoradas(mejorValoradas);
        setListNuevas(nuevas);
        setListRecomendadas(recomendadas);

        if (peliculaAbierta) {
            const todas = [...mejorValoradas, ...nuevas, ...recomendadas];
            const actualizada = todas.find((p) => p.id === peliculaAbierta.id);
            if (actualizada) {
                setPeliculaAbierta((prev) => ({
                    ...actualizada,
                    es_favorito: actualizada.es_favorito,
                    es_vista: actualizada.es_vista,
                    mi_valoracion: prev?.mi_valoracion ?? actualizada.mi_valoracion,
                    comentarios: actualizada.comentarios || prev.comentarios
                }));
            }
        }
    }, [mejorValoradas, nuevas, recomendadas]);

    const resolvePoster = (path) => {
        if (!path) return '/dist/assets/img/posters/default.jpg';
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    const handleToggleFavorito = (e, peliculaId) => {
        e.stopPropagation();

        const actualizarLista = (lista) =>
            lista.map((p) => (p.id === peliculaId ? { ...p, es_favorito: !p.es_favorito } : p));

        setListMejorValoradas(actualizarLista);
        setListNuevas(actualizarLista);
        setListRecomendadas(actualizarLista);

        if (peliculaAbierta && peliculaAbierta.id === peliculaId) {
            setPeliculaAbierta((prev) => ({ ...prev, es_favorito: !prev.es_favorito }));
        }

        router.post(route('user.favoritos.toggle', peliculaId), {}, { preserveScroll: true, preserveState: true });
    };

    const handleToggleVistaModal = () => {
        if (!peliculaAbierta) return;
        setPeliculaAbierta((prev) => ({ ...prev, es_vista: !prev.es_vista }));
        router.post(route('user.vistas.toggle'), { pelicula_id: peliculaAbierta.id }, { preserveScroll: true, preserveState: true });
    };

    const handleToggleFavoritoModal = () => {
        if (!peliculaAbierta) return;
        handleToggleFavorito({ stopPropagation: () => {} }, peliculaAbierta.id);
    };

    const handleCalificar = (e, puntuacion) => {
        e.stopPropagation();
        if (!peliculaAbierta || enviandoValoracion) return;
        const anterior = peliculaAbierta.mi_valoracion;
        setEnviandoValoracion(true);

        setPeliculaAbierta(prev => ({ ...prev, mi_valoracion: puntuacion }));

        router.post(
            route('user.valoraciones.store'),
            { pelicula_id: peliculaAbierta.id, puntuacion: puntuacion },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => setPeliculaAbierta(prev => ({ ...prev, mi_valoracion: anterior })),
                onFinish: () => setEnviandoValoracion(false),
            }
        );
    };

    const handleEnviarComentario = (e) => {
        e.preventDefault();
        if (!peliculaAbierta || !nuevoComentario.trim() || enviandoComentario) return;

        setEnviandoComentario(true);
        router.post(
            route('user.comentarios.store'),
            { pelicula_id: peliculaAbierta.id, texto: nuevoComentario },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setNuevoComentario(''),
                onFinish: () => setEnviandoComentario(false),
            }
        );
    };

    const handleActualizarComentario = (comentarioId) => {
        if (!textoEditado.trim()) return;
        router.put(
            route('user.comentarios.update', comentarioId),
            { texto: textoEditado },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setEditandoId(null);
                    setTextoEditado('');
                },
            }
        );
    };

    const handleEliminarComentario = (comentarioId) => {
        router.delete(route('user.comentarios.destroy', comentarioId), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Filtro por género 100% en el navegador: no navega ni recarga la página
    const handleFiltrarGenero = (generoId) => {
        setSelectedGenero(selectedGenero === generoId ? '' : generoId);
    };

    const filtrarPorGenero = (lista) => {
        const filtradas = selectedGenero === ''
            ? lista
            : lista.filter((p) => String(p.genero_id) === String(selectedGenero));
        return filtradas.slice(0, selectedGenero === '' ? 10 : 30);
    };

    const renderMovieRow = (titulo, peliculas) => {
        const rowRef = React.createRef();

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

                <div ref={rowRef} className="d-flex gap-3 pb-2" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {peliculas.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => { setPeliculaAbierta(p); setPosterAmpliado(false); }}
                            style={{
                                flex: '0 0 auto',
                                width: '150px',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundColor: '#141414',
                                transition: 'transform 0.3s ease',
                            }}
                        >
                            <img
                                src={resolvePoster(p.poster)}
                                alt={p.titulo}
                                style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                            />

                            <button
                                type="button"
                                onClick={(e) => handleToggleFavorito(e, p.id)}
                                style={{
                                    position: 'absolute', top: '6px', right: '6px',
                                    background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                                    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', zIndex: 3,
                                }}
                            >
                                <span
                                    style={{
                                        color: p.es_favorito ? '#e63950' : '#ffffff',
                                        fontSize: '1.05rem',
                                        lineHeight: 1,
                                    }}
                                >
                                    {p.es_favorito ? '♥' : '♡'}
                                </span>
                            </button>

                            <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 10%, transparent 100%)' }}>
                                <div className="text-white fw-semibold text-truncate" style={{ fontSize: '0.78rem' }}>{p.titulo}</div>
                                <div className="text-warning" style={{ fontSize: '0.72rem' }}>★ {p.valoracion_promedio ?? 0}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout auth={auth} title="Inicio">
            <Head title="Inicio" />

            <FlashToast flash={flash} />

            <section
                style={{
                    position: 'relative', minHeight: '320px', paddingTop: '70px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 40%',
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,8,0.55) 0%, rgba(5,5,8,0.9) 80%, #000 100%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                    <h1 className="text-white mb-2" style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
                        Bienvenido, {auth?.user?.nombre || 'Cinéfilo'}
                    </h1>
                    <p className="text-light mb-3" style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '620px' }}>
                        Explora las películas más destacadas, descubre los últimos estrenos agregados a la comunidad y recibe recomendaciones personalizadas.
                    </p>

                    <div className="d-flex flex-wrap gap-2 mt-3 pb-2" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                        <button
                            onClick={() => handleFiltrarGenero('')}
                            className={`btn btn-sm px-3 py-1 ${selectedGenero === '' ? 'btn-light fw-bold text-dark' : 'btn-outline-light'}`}
                            style={{ fontSize: '0.8rem', borderRadius: '20px' }}
                        >
                            Todos
                        </button>
                        {generos.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => handleFiltrarGenero(g.id)}
                                className={`btn btn-sm px-3 py-1 ${selectedGenero == g.id ? 'btn-light fw-bold text-dark' : 'btn-outline-light'}`}
                                style={{ fontSize: '0.8rem', borderRadius: '20px' }}
                            >
                                {g.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ backgroundColor: '#000', paddingTop: '20px', paddingBottom: '30px' }}>
                <div className="container-fluid px-4 px-lg-5">
                    {renderMovieRow("Mejor Valoradas", filtrarPorGenero(listMejorValoradas))}
                    {renderMovieRow("Últimas Agregadas", filtrarPorGenero(listNuevas))}
                    {renderMovieRow("Recomendadas para ti", filtrarPorGenero(listRecomendadas))}
                </div>
            </section>

            <section style={{ backgroundColor: '#08080a', paddingTop: '10px', paddingBottom: '60px' }}>
                <div className="container-fluid px-4 px-lg-5">
                    <h3 className="text-white mb-4" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        <i className="fas fa-star text-warning me-2"></i>Reseñas Destacadas de Editores
                    </h3>

                    <div className="row g-3">
                        {resenasMejorValoradas && resenasMejorValoradas.length > 0 ? (
                            resenasMejorValoradas.map((r) => (
                                <div key={r.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card text-white border-secondary h-100 p-3 shadow-sm" style={{ backgroundColor: '#141414' }}>
                                        <div className="d-flex gap-3 align-items-start mb-2">
                                            <img
                                                src={resolvePoster(r.pelicula_poster)}
                                                alt={r.pelicula}
                                                style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                            />
                                            <div className="overflow-hidden">
                                                <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{r.titulo}</h6>
                                                <small className="text-white-50">{r.pelicula}</small>
                                                <div className="mt-1">
                                                    <RatingStarsResena resena={r} />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-white-50 small mb-3" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                                            "{r.contenido}"
                                        </p>
                                        <div className="mt-auto d-flex justify-content-between text-white-50 border-top border-secondary pt-2" style={{ fontSize: '0.72rem' }}>
                                            <span>Por: <strong className="text-light">{r.autor}</strong></span>
                                            <span>{r.fecha}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <p className="text-white-50 text-center py-3">No hay reseñas de editores disponibles por el momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {peliculaAbierta && (
                <div
                    onClick={() => { setPeliculaAbierta(null); setPosterAmpliado(false); }}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1040,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '20px 16px',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#141414', color: '#fff', borderRadius: '8px',
                            maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative'
                        }}
                    >
                        {posterAmpliado && (
                            <div
                                onClick={() => setPosterAmpliado(false)}
                                style={{
                                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 1100,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '8px'
                                }}
                            >
                                <img
                                    src={resolvePoster(peliculaAbierta.poster)}
                                    alt={peliculaAbierta.titulo}
                                    style={{ maxWidth: '320px', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.9)' }}
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPosterAmpliado(false); }}
                                    style={{
                                        position: 'absolute', top: '15px', right: '15px', width: '35px', height: '35px',
                                        borderRadius: '50%', border: 'none', backgroundColor: '#333', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', zIndex: 1150
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}

                        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                            <img
                                src={resolvePoster(peliculaAbierta.poster)}
                                alt={peliculaAbierta.titulo}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                            />
                            {/* Botón de cierre (la tacha) arreglado con zIndex alto y stopPropagation */}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPeliculaAbierta(null); setPosterAmpliado(false); }}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px', width: '35px', height: '35px',
                                    borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    color: '#fff', fontSize: '1.1rem', cursor: 'pointer', zIndex: 1050,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Cerrar"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                            <div className="position-absolute bottom-0 start-0 p-3 w-100" style={{ background: 'linear-gradient(0deg, rgba(20,20,20,0.95) 10%, transparent 100%)' }}>
                                <h2 className="mb-1" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{peliculaAbierta.titulo}</h2>
                                <div className="d-flex flex-wrap align-items-center gap-2 text-white-50" style={{ fontSize: '0.8rem' }}>
                                    <span>{peliculaAbierta.anio || 'N/A'}</span>
                                    {peliculaAbierta.duracion_min && <span>· {peliculaAbierta.duracion_min} min</span>}
                                    <span className="badge" style={{ backgroundColor: '#5c8d89' }}>{peliculaAbierta.genero}</span>
                                    {peliculaAbierta.pais && <span>· {peliculaAbierta.pais}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="row g-3 mb-2 align-items-start">
                                <div className="col-4 col-sm-3">
                                    <img
                                        src={resolvePoster(peliculaAbierta.poster)}
                                        alt={peliculaAbierta.titulo}
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
                                            <Puntuador
                                                valor={peliculaAbierta.mi_valoracion || 0}
                                                onChange={(n) => handleCalificar({ stopPropagation: () => {} }, n)}
                                                deshabilitado={enviandoValoracion}
                                            />
                                            <div className="text-white-50 mt-1" style={{ fontSize: '0.72rem' }}>
                                                Promedio {peliculaAbierta.valoracion_promedio ?? 0} ★ · {peliculaAbierta.total_valoraciones ?? 0} valoraciones
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                onClick={handleToggleVistaModal}
                                                className="btn btn-sm px-3 py-1"
                                                style={{
                                                    backgroundColor: peliculaAbierta.es_vista ? '#5c8d89' : 'transparent',
                                                    border: `1px solid ${peliculaAbierta.es_vista ? '#5c8d89' : 'rgba(255,255,255,0.4)'}`,
                                                    color: '#fff', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px',
                                                }}
                                            >
                                                <i className={`fas ${peliculaAbierta.es_vista ? 'fa-check-circle' : 'fa-eye'} me-1`}></i>
                                                {peliculaAbierta.es_vista ? 'Vista' : 'Marcar vista'}
                                            </button>
                                            <button
                                                onClick={handleToggleFavoritoModal}
                                                className="btn btn-sm px-3 py-1"
                                                style={{
                                                    backgroundColor: peliculaAbierta.es_favorito ? '#e63950' : 'transparent',
                                                    border: `1px solid ${peliculaAbierta.es_favorito ? '#e63950' : 'rgba(255,255,255,0.4)'}`,
                                                    color: '#fff', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px',
                                                }}
                                            >
                                                <span className="me-1">{peliculaAbierta.es_favorito ? '♥' : '♡'}</span>
                                                {peliculaAbierta.es_favorito ? 'Favorita' : 'Favorito'}
                                            </button>
                                        </div>
                                    </div>

                                    {peliculaAbierta.director && (
                                        <p className="text-white mb-1" style={{ fontSize: '0.82rem' }}>
                                            <strong className="text-white-50">Director:</strong> {peliculaAbierta.director}
                                        </p>
                                    )}
                                    {peliculaAbierta.elenco && (
                                        <p className="text-white mb-1" style={{ fontSize: '0.82rem' }}>
                                            <strong className="text-white-50">Elenco:</strong> {peliculaAbierta.elenco}
                                        </p>
                                    )}
                                    {Array.isArray(peliculaAbierta.plataformas) && peliculaAbierta.plataformas.length > 0 && (
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                            <strong className="text-white-50" style={{ fontSize: '0.82rem' }}>Disponible en:</strong>
                                            {peliculaAbierta.plataformas.map((pl) => (
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
                                    {peliculaAbierta.trailer_url && (
                                        <div className="mt-2 mb-2">
                                            <a
                                                href={peliculaAbierta.trailer_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                <i className="fab fa-youtube me-1"></i> Ver Tráiler oficial
                                            </a>
                                        </div>
                                    )}
                                    <p className="text-white mb-0 mt-2" style={{ fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.95 }}>
                                        {peliculaAbierta.sinopsis || 'Sin descripción disponible.'}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-secondary my-3" />

                            <h5 className="text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>Comentarios de la Comunidad</h5>
                            
                            <form onSubmit={handleEnviarComentario} className="mb-4">
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
                                        className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center px-3" 
                                        disabled={enviandoComentario || !nuevoComentario.trim()}
                                        title="Publicar comentario"
                                        style={{ height: '31px', borderRadius: '0 4px 4px 0' }}
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </form>

                            <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {peliculaAbierta.comentarios && peliculaAbierta.comentarios.length > 0 ? (
                                    peliculaAbierta.comentarios.map((c) => (
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
                                                                    onClick={() => handleActualizarComentario(c.id)}
                                                                    className="btn btn-sm btn-success px-2 py-1"
                                                                    title="Guardar"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => { setEditandoId(null); setTextoEditado(''); }}
                                                                    className="btn btn-sm btn-secondary px-2 py-1"
                                                                    title="Cancelar"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-white-50 mb-0">{c.texto}</p>
                                                    )}
                                                </div>

                                                {c.es_mio && editandoId !== c.id && (
                                                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => { setEditandoId(c.id); setTextoEditado(c.texto); }}
                                                            className="btn btn-sm p-1 border-0 bg-transparent text-white"
                                                            title="Editar comentario"
                                                            style={{ fontSize: '0.9rem' }}
                                                        >
                                                            <i className="fas fa-edit" style={{ color: '#ffffff' }}></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminarComentario(c.id)}
                                                            className="btn btn-sm p-1 border-0 bg-transparent text-white"
                                                            title="Eliminar comentario"
                                                            style={{ fontSize: '0.9rem' }}
                                                        >
                                                            <i className="fas fa-trash-alt" style={{ color: '#ffffff' }}></i>
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
            )}
        </AuthenticatedLayout>
    );
}