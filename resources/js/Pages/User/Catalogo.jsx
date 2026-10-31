import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';
import { MovieModal, FlashToast } from '@/Components/UserWidgets';

export default function Catalogo({ auth, peliculas = [], generos = [], filtros = {} }) {
    const { flash } = usePage().props;

    const [q, setQ] = useState(filtros?.q || '');
    const [generoId, setGeneroId] = useState(filtros?.genero_id || '');
    const [anio, setAnio] = useState(filtros?.anio || '');
    const [valoracionMin, setValoracionMin] = useState(filtros?.valoracion_min || '');
    const [plataforma, setPlataforma] = useState(filtros?.plataforma || '');
    const [peliculaAbierta, setPeliculaAbierta] = useState(null);

    const aplicarFiltros = (e) => {
        e?.preventDefault();
        router.get(route('user.catalogo'), {
            q: q || undefined,
            genero_id: generoId || undefined,
            anio: anio || undefined,
            valoracion_min: valoracionMin || undefined,
            plataforma: plataforma || undefined,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const limpiarFiltros = () => {
        setQ(''); setGeneroId(''); setAnio(''); setValoracionMin(''); setPlataforma('');
        router.get(route('user.catalogo'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const getPoster = (p) => {
        const path = p.poster;
        if (!path) return '/dist/assets/img/posters/default.jpg';
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    const abrirPelicula = (p) => {
        setPeliculaAbierta(p);
        router.post(route('user.historial.store'), { pelicula_id: p.id }, { preserveScroll: true, preserveState: true, only: [] });
    };

    const toggleFavorito = (e, peliculaId) => {
        e.stopPropagation();
        router.patch(route('user.favoritos.toggle', peliculaId), {}, { preserveScroll: true, preserveState: true });
    };

    const hayFiltrosActivos = q || generoId || anio || valoracionMin || plataforma;

    return (
        <AuthenticatedLayout auth={auth} title="Catálogo">
            <FlashToast flash={flash} />

            <style>{`
                @keyframes tituloEntrada {
                    0% { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                @keyframes brilloSutil {
                    0%, 100% { text-shadow: 0 0 18px rgba(92, 141, 137, 0.35); }
                    50% { text-shadow: 0 0 28px rgba(92, 141, 137, 0.6); }
                }
                .titulo-cine {
                    font-family: 'Lora', 'Georgia', serif;
                    font-style: italic;
                    font-weight: 800;
                    animation: tituloEntrada 0.9s cubic-bezier(0.22, 1, 0.36, 1) both,
                               brilloSutil 4s ease-in-out infinite 0.9s;
                }
                .tarjeta-poster {
                    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
                    animation: tituloEntrada 0.6s ease both;
                }
                .tarjeta-poster:hover {
                    transform: translateY(-8px) scale(1.04);
                    box-shadow: 0 18px 34px rgba(0,0,0,0.55);
                    z-index: 5;
                }
                .tarjeta-poster img {
                    transition: filter 0.35s ease;
                }
                .tarjeta-poster:hover img {
                    filter: brightness(1.08);
                }
                .btn-favorito {
                    transition: transform 0.2s ease, color 0.2s ease;
                }
                .btn-favorito:hover {
                    transform: scale(1.25);
                }
            `}</style>

            {/* Hero estilo Welcome: título cursiva en negrita animado */}
            <section
                style={{
                    position: 'relative', minHeight: '280px', paddingTop: '70px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 40%',
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,8,0.55) 0%, rgba(5,5,8,0.9) 80%, #000 100%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                    <h1
                        className="titulo-cine text-white mb-2"
                        style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', letterSpacing: '0.01em' }}
                    >
                        Catálogo
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '620px' }}>
                        Explora todo el catálogo de CineReseñas: filtra por título, género, año, valoración o plataforma de streaming.
                    </p>
                </div>
            </section>

            <section style={{ backgroundColor: '#000', paddingTop: '28px', paddingBottom: '70px', minHeight: '60vh' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Filtros */}
                    <form onSubmit={aplicarFiltros} className="d-flex flex-wrap gap-2 mb-4 align-items-center">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ maxWidth: '220px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', fontSize: '0.85rem' }}
                            placeholder="Buscar título..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: '180px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', fontSize: '0.85rem' }}
                            value={generoId}
                            onChange={(e) => setGeneroId(e.target.value)}
                        >
                            <option value="">Género</option>
                            {generos.map((g) => (
                                <option key={g.id} value={g.id}>{g.nombre}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ maxWidth: '110px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', fontSize: '0.85rem' }}
                            placeholder="Año"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                        />
                        <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: '150px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', fontSize: '0.85rem' }}
                            value={valoracionMin}
                            onChange={(e) => setValoracionMin(e.target.value)}
                        >
                            <option value="">Valoración mín.</option>
                            <option value="4">★ 4 o más</option>
                            <option value="3">★ 3 o más</option>
                            <option value="2">★ 2 o más</option>
                            <option value="1">★ 1 o más</option>
                        </select>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ maxWidth: '160px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', fontSize: '0.85rem' }}
                            placeholder="Plataforma"
                            value={plataforma}
                            onChange={(e) => setPlataforma(e.target.value)}
                        />
                        <button type="submit" className="btn btn-sm px-4" style={{ backgroundColor: '#5c8d89', color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>
                            Filtrar
                        </button>
                        {hayFiltrosActivos && (
                            <button type="button" className="btn btn-outline-light btn-sm px-3" onClick={limpiarFiltros} style={{ fontSize: '0.8rem' }}>
                                Limpiar
                            </button>
                        )}
                    </form>

                    {/* Resultados */}
                    {peliculas.length > 0 ? (
                        <div className="row g-4">
                            {peliculas.map((p, idx) => (
                                <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={p.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                                    <div
                                        className="tarjeta-poster position-relative rounded overflow-hidden"
                                        style={{ cursor: 'pointer', backgroundColor: '#141414' }}
                                        onClick={() => abrirPelicula(p)}
                                    >
                                        <img
                                            src={getPoster(p)}
                                            alt={p.titulo}
                                            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                        />
                                        <button
                                            className="btn-favorito position-absolute"
                                            style={{
                                                top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none',
                                                borderRadius: '50%', width: '28px', height: '28px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: p.es_favorito ? '#e63950' : '#fff',
                                            }}
                                            onClick={(e) => toggleFavorito(e, p.id)}
                                            title={p.es_favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                        >
                                            <i className={`fa${p.es_favorito ? 's' : 'r'} fa-heart`} style={{ fontSize: '0.75rem' }}></i>
                                        </button>
                                        <div
                                            className="position-absolute bottom-0 start-0 w-100 p-2"
                                            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, transparent 100%)' }}
                                        >
                                            <div className="text-white fw-semibold" style={{ fontSize: '0.78rem', lineHeight: '1.2' }}>
                                                {p.titulo}
                                            </div>
                                            <div className="text-warning" style={{ fontSize: '0.72rem' }}>
                                                ★ {p.valoracion_promedio} · {p.anio || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            <i className="fas fa-film fa-3x mb-3 d-block opacity-50"></i>
                            No se encontraron películas con esos filtros.
                        </div>
                    )}
                </div>
            </section>

            {peliculaAbierta && <MovieModal pelicula={peliculaAbierta} onClose={() => setPeliculaAbierta(null)} />}
        </AuthenticatedLayout>
    );
}