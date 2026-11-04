import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, router } from '@inertiajs/react';
import { PosterImg, FlashToast } from '@/Components/UserWidgets';

/* Quita acentos y mayúsculas para búsquedas flexibles */
const norm = (s) =>
    (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Estilo de control rectangular idéntico al catálogo
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

/* Puntuación 1-5 con botones para valorar una reseña */
function EstrellasResena({ resena }) {
    const [valor, setValor] = useState(resena.mi_valoracion || 0);
    const [enviando, setEnviando] = useState(false);
    const [hover, setHover] = useState(0);

    const valorar = (n) => {
        if (enviando) return;
        const anterior = valor;
        setEnviando(true);
        setValor(n);
        router.post(
            route('user.resenas.valorar'),
            { resena_id: resena.id, puntuacion: n },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => setValor(anterior),
                onFinish: () => setEnviando(false),
            }
        );
    };

    return (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Valorar reseña:</span>
            <div className="d-inline-flex align-items-center" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => {
                    const lleno = (hover || valor) >= n;
                    return (
                        <button
                            key={n}
                            type="button"
                            disabled={enviando}
                            onClick={() => valorar(n)}
                            onMouseEnter={() => setHover(n)}
                            title={`Puntuar con ${n} estrella${n > 1 ? 's' : ''}`}
                            style={{
                                background: 'none', border: 'none', padding: '0 2px',
                                color: lleno ? '#ffc107' : '#adb5bd', fontSize: '1.2rem', lineHeight: 1,
                                cursor: enviando ? 'wait' : 'pointer',
                                transition: 'transform 0.15s ease',
                                transform: hover === n ? 'scale(1.2)' : 'scale(1)',
                            }}
                        >
                            {lleno ? '★' : '☆'}
                        </button>
                    );
                })}
            </div>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                Promedio {resena.valoracion_promedio ?? 0} ★ · {resena.total_valoraciones ?? 0} valoraciones
            </span>
        </div>
    );
}

export default function Resenas({ auth, resenas = [], editores = [] }) {
    const { flash } = usePage().props;
    const [pelicula, setPelicula] = useState('');
    const [autor, setAutor] = useState('');
    const [calificacion, setCalificacion] = useState('');
    const [soloGuardadas, setSoloGuardadas] = useState(false);
    const [expandida, setExpandida] = useState(null);
    const [guardadasLocal, setGuardadasLocal] = useState({});

    const toggleGuardar = (id) => {
        setGuardadasLocal((prev) => ({ ...prev, [id]: !(prev[id] ?? resenas.find(r => r.id === id)?.guardada) }));
        router.post(route('user.resenas.guardar', id), {}, { preserveScroll: true, preserveState: true });
    };

    const limpiarFiltros = () => {
        setPelicula('');
        setAutor('');
        setCalificacion('');
        setSoloGuardadas(false);
    };

    // Obtener lista única de autores/editores
    const listaEditores = useMemo(() => {
        if (editores && editores.length > 0) return editores;
        const unicos = new Set(resenas.map((r) => r.autor).filter(Boolean));
        return Array.from(unicos);
    }, [resenas, editores]);

    // Filtrado local en tiempo real usando el promedio de valoraciones de la comunidad
    const filtradas = useMemo(() => {
        const pText = norm(pelicula);
        const aText = norm(autor);
        const calNum = calificacion ? parseInt(calificacion, 10) : null;

        return resenas.filter((r) => {
            const estaGuardada = guardadasLocal[r.id] ?? r.guardada;
            if (pText && !norm(r.pelicula).includes(pText)) return false;
            if (aText && norm(r.autor) !== aText) return false;
            
            // Filtro basado en el promedio total de valoraciones de los usuarios (redondeado al entero más cercano o coincidencia exacta de rango)
            if (calNum !== null) {
                const promedio = Math.round(Number(r.valoracion_promedio) || 0);
                if (promedio !== calNum) return false;
            }

            if (soloGuardadas && !estaGuardada) return false;
            return true;
        });
    }, [resenas, pelicula, autor, calificacion, soloGuardadas, guardadasLocal]);

    const hayFiltrosActivos = pelicula || autor || calificacion || soloGuardadas;

    return (
        <AuthenticatedLayout auth={auth} title="Reseñas">
            <FlashToast flash={flash} />

            <style>{`
                .filtro-control::placeholder { color: rgba(255,255,255,0.45); }
                .filtro-control:focus { border-color: #5c8d89 !important; }
            `}</style>

            {/* Banner superior con difuminado */}
            <section style={{
                position: 'relative', minHeight: '260px', paddingTop: '70px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 40%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,10,0.4) 0%, rgba(8,8,10,0.85) 75%, #08080a 100%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                    <h1 className="text-white mb-2" style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
                        Reseñas
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '640px' }}>
                        Explora las reseñas publicadas por nuestros editores y guarda las que quieras volver a leer.
                    </p>
                </div>
            </section>

            {/* Sección principal con fondo oscuro y relajante (#08080a) */}
            <section className="py-4" style={{ backgroundColor: '#08080a', minHeight: '60vh', paddingBottom: '70px' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Filtros organizados en cuadrícula uno al lado de otro del mismo tamaño */}
                    <div className="mb-4">
                        <div
                            className="mb-3"
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}
                        >
                            <input
                                type="text"
                                className="filtro-control"
                                style={control}
                                placeholder="Buscar por película..."
                                value={pelicula}
                                onChange={(e) => setPelicula(e.target.value)}
                                maxLength={100}
                            />

                            <select
                                className="filtro-control"
                                style={control}
                                value={autor}
                                onChange={(e) => setAutor(e.target.value)}
                            >
                                <option value="">Todos los autores (editores)</option>
                                {listaEditores.map((ed) => (
                                    <option key={ed} value={ed}>{ed}</option>
                                ))}
                            </select>

                            <select
                                className="filtro-control"
                                style={control}
                                value={calificacion}
                                onChange={(e) => setCalificacion(e.target.value)}
                            >
                                <option value="">Calificación promedio (comunidad)</option>
                                <option value="5">5 Estrellas</option>
                                <option value="4">4 Estrellas</option>
                                <option value="3">3 Estrellas</option>
                                <option value="2">2 Estrellas</option>
                                <option value="1">1 Estrella</option>
                            </select>

                            <button
                                type="button"
                                className="btn btn-outline-light px-4 d-flex align-items-center justify-content-center"
                                style={{ height: '40px', borderRadius: '4px', fontSize: '0.85rem', opacity: hayFiltrosActivos ? 1 : 0.5, width: '100%' }}
                                onClick={limpiarFiltros}
                                disabled={!hayFiltrosActivos}
                            >
                                Limpiar filtros
                            </button>
                        </div>

                        <div className="d-flex align-items-center">
                            <div className="form-check text-white-50" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input
                                    className="form-check-input bg-dark border-secondary"
                                    type="checkbox"
                                    id="soloGuardadas"
                                    checked={soloGuardadas}
                                    onChange={(e) => setSoloGuardadas(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label className="form-check-label text-white" htmlFor="soloGuardadas" style={{ cursor: 'pointer' }}>
                                    Solo reseñas guardadas
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Listado de Reseñas con diseño original claro y limpio */}
                    <div className="row g-3">
                        {filtradas.length > 0 ? filtradas.map((r) => {
                            const estaGuardada = guardadasLocal[r.id] ?? r.guardada;
                            return (
                                <div key={r.id} className="col-12">
                                    <div className="card border-0 shadow-sm p-3 d-flex flex-row gap-3 align-items-start position-relative" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                        <div style={{ width: '60px', height: '85px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                            <PosterImg src={r.pelicula_poster} titulo={r.pelicula} />
                                        </div>
                                        <div className="flex-grow-1 position-relative pb-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem' }}>{r.titulo}</h6>
                                                    <span className="text-muted small">{r.pelicula} · por {r.autor} · {r.fecha}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="text-warning small">★ {r.calificacion}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm p-1 border-0"
                                                        onClick={() => toggleGuardar(r.id)}
                                                        title={estaGuardada ? 'Quitar de guardadas' : 'Guardar reseña'}
                                                        style={{
                                                            backgroundColor: estaGuardada ? '#2a9d8f' : 'transparent',
                                                            color: estaGuardada ? '#ffffff' : '#6c757d',
                                                            borderRadius: '4px',
                                                            width: '30px',
                                                            height: '30px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'background-color 0.2s ease, color 0.2s ease'
                                                        }}
                                                    >
                                                        <i className="fas fa-bookmark" style={{ fontSize: '0.9rem' }}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-dark small mt-2 mb-2" style={{ maxHeight: expandida === r.id ? 'none' : '2.6em', overflow: 'hidden', lineHeight: '1.5' }}>
                                                {r.contenido}
                                            </p>

                                            {/* Botón de ampliar con flechas ubicado exactamente en la esquina inferior derecha */}
                                            <div className="position-absolute bottom-0 end-0">
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm p-0 text-decoration-none"
                                                    style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2a9d8f' }}
                                                    onClick={() => setExpandida(expandida === r.id ? null : r.id)}
                                                    title={expandida === r.id ? 'Ver menos' : 'Ampliar'}
                                                >
                                                    {expandida === r.id ? '⤡' : '⤢'}
                                                </button>
                                            </div>

                                            <div className="mt-3">
                                                <EstrellasResena resena={r} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                No se encontraron reseñas con esos criterios.
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}