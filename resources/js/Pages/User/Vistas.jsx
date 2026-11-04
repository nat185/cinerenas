import React, { useState, useEffect, useMemo, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

const norm = (s) =>
    (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const resolvePoster = (path) => {
    if (!path) return '/dist/assets/img/posters/default.jpg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
};

const control = {
    width: '100%',
    height: '40px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '0 10px',
    fontSize: '0.78rem',
    outline: 'none',
    colorScheme: 'dark',
};

const PLATAFORMAS_DISPONIBLES = [
    'Netflix', 'Max', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 
    'Paramount+', 'MUBI', 'Claro Video', 'Pluto TV', 'Tubi', 'Plex', 'Mercado Play'
];

const PAISES_DISPONIBLES = [
    'México', 'Estados Unidos', 'España', 'Argentina', 'Francia', 
    'Reino Unido', 'Japón', 'Corea del Sur', 'Italia', 'Alemania', 
    'Canadá', 'Brasil', 'Colombia', 'Chile', 'Otro'
];

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

function PeliculaModal({ pelicula, onClose }) {
    const [esVista, setEsVista] = useState(!!pelicula.es_vista);
    const [miValoracion, setMiValoracion] = useState(pelicula.mi_valoracion || 0);
    const [enviandoValoracion, setEnviandoValoracion] = useState(false);
    const [posterAmpliado, setPosterAmpliado] = useState(false);

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
                                        <span key={pl} className="badge rounded-pill" style={{ backgroundColor: 'rgba(92,141,137,0.25)', color: '#9fd4cf', fontSize: '0.72rem', padding: '5px 10px' }}>
                                            {pl}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="text-white mb-0 mt-2" style={{ fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.95 }}>
                                {pelicula.sinopsis || 'Sin descripción disponible.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PeliculasVistas({ auth, peliculasVistas = [], generos = [] }) {
    const { flash } = usePage().props;

    const [q, setQ] = useState('');
    const [generoId, setGeneroId] = useState('');
    const [anio, setAnio] = useState('');
    const [duracion, setDuracion] = useState('');
    const [pais, setPais] = useState('');
    const [fechaAgregado, setFechaAgregado] = useState('');
    const [plataformasSel, setPlataformasSel] = useState([]);
    const [panelPlataformas, setPanelPlataformas] = useState(false);

    const [abiertaId, setAbiertaId] = useState(null);
    const [posterAmpliadoUrl, setPosterAmpliadoUrl] = useState(null);
    const [ocultasLocales, setOcultasLocales] = useState({});

    const panelRef = useRef(null);

    useEffect(() => {
        const cerrar = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setPanelPlataformas(false);
        };
        document.addEventListener('mousedown', cerrar);
        return () => document.removeEventListener('mousedown', cerrar);
    }, []);

    const handleFechaChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);

        let formateada = '';
        if (val.length > 0) formateada += val.slice(0, 2);
        if (val.length >= 3) formateada += '/' + val.slice(2, 4);
        if (val.length >= 5) formateada += '/' + val.slice(4, 8);
        setFechaAgregado(formateada);
    };

    const ocultarVista = (id) => {
        setOcultasLocales((prev) => ({ ...prev, [id]: true }));
        router.post(route('user.vistas.toggle'), { pelicula_id: id }, { preserveScroll: true, preserveState: true });
    };

    const listaBase = useMemo(
        () => peliculasVistas.filter((p) => !ocultasLocales[p.id]),
        [peliculasVistas, ocultasLocales]
    );

    const anioMin = 1888;
    const anioMax = new Date().getFullYear();
    const aniosDisponibles = useMemo(() => {
        const out = [];
        for (let a = anioMax; a >= anioMin; a--) out.push(a);
        return out;
    }, [anioMin, anioMax]);

    const anioInvalido = anio.length === 4 && (Number(anio) < anioMin || Number(anio) > anioMax);

    const filtradas = useMemo(() => {
        const texto = norm(q);
        const duracionMax = duracion ? parseInt(duracion, 10) : 0;

        return listaBase.filter((p) => {
            if (texto) {
                const campos = [p.titulo, p.autor, p.director, p.elenco].map(norm).join(' | ');
                if (!campos.includes(texto)) return false;
            }
            if (generoId && String(p.genero_id) !== String(generoId)) return false;
            if (anio.length === 4 && !anioInvalido && Number(p.anio) !== Number(anio)) return false;
            if (duracionMax > 0 && !(Number(p.duracion_min) > 0 && Number(p.duracion_min) <= duracionMax)) return false;
            if (pais && norm(p.pais) !== norm(pais)) return false;
            if (fechaAgregado.length === 10) {
                if (p.fecha_agregado !== fechaAgregado) return false;
            }
            if (plataformasSel.length > 0) {
                const suyas = Array.isArray(p.plataformas) ? p.plataformas : [];
                if (!plataformasSel.some((s) => suyas.includes(s))) return false;
            }
            return true;
        });
    }, [listaBase, q, generoId, anio, anioInvalido, duracion, pais, fechaAgregado, plataformasSel]);

    const hayFiltros = q || generoId || anio || duracion || pais || fechaAgregado || plataformasSel.length > 0;

    const limpiar = () => {
        setQ(''); setGeneroId(''); setAnio(''); setDuracion(''); setPais(''); setFechaAgregado(''); setPlataformasSel([]);
    };

    const alternarPlataforma = (nombre) => {
        setPlataformasSel((prev) => (prev.includes(nombre) ? prev.filter((x) => x !== nombre) : [...prev, nombre]));
    };

    const generarPDF = () => {
        const tieneSSL = window.location.protocol === 'https:';
        const urlPagina = tieneSSL ? window.location.href : `${window.location.origin}/welcome`;

        const contenidoVentana = window.open('', '_blank');
        const html = `
            <html>
                <head>
                    <title>Mi Lista de Películas Vistas - CineReseñas</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; padding: 20px; }
                        h1 { color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 10px; }
                        .url-info { margin-bottom: 15px; font-size: 0.85rem; color: #555; background: #f1f1f1; padding: 8px; border-radius: 4px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.85rem; }
                        th { background-color: #f8f9fa; }
                    </style>
                </head>
                <body>
                    <h1>CineReseñas - Películas Vistas</h1>
                    <div class="url-info">
                        <strong>URL del Sistema:</strong> <a href="${urlPagina}" target="_blank">${urlPagina}</a>
                        ${!tieneSSL ? '<br><small style="color: #e63950;">(Certificado SSL/TLS no detectado: redirigido a página de bienvenida)</small>' : ''}
                    </div>
                    <p>Reporte generado el ${new Date().toLocaleDateString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Género</th>
                                <th>Año</th>
                                <th>Plataforma(s)</th>
                                <th>Fecha Agregado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtradas.map(p => `
                                <tr>
                                    <td><strong>${p.titulo}</strong></td>
                                    <td>${p.genero || 'N/A'}</td>
                                    <td>${p.anio || 'N/A'}</td>
                                    <td>${Array.isArray(p.plataformas) ? p.plataformas.join(', ') : (p.plataformas || 'N/A')}</td>
                                    <td>${p.fecha_agregado || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `;
        contenidoVentana.document.write(html);
        contenidoVentana.document.close();
    };

    const abierta = abiertaId ? peliculasVistas.find((p) => p.id === abiertaId) : null;

    return (
        <AuthenticatedLayout auth={auth} title="Películas Vistas">
            <Head title="Películas Vistas" />
            <ToastMensaje flash={flash} />

            <style>{`
                .filtro-control::placeholder { color: rgba(255,255,255,0.45); }
                .filtro-control:focus { border-color: #5c8d89 !important; }
            `}</style>

            {posterAmpliadoUrl && (
                <div
                    onClick={() => setPosterAmpliadoUrl(null)}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 11000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    }}
                >
                    <img
                        src={posterAmpliadoUrl}
                        alt="Póster ampliado"
                        style={{ maxWidth: '340px', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.9)' }}
                    />
                </div>
            )}

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
                        Películas Vistas
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '640px' }}>
                        Historial de todas las películas que has marcado como vistas.
                    </p>
                </div>
            </section>

            <section style={{ backgroundColor: '#08080a', paddingTop: '24px', paddingBottom: '70px', minHeight: '60vh' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Barra de búsqueda con "Limpiar filtros" a la derecha */}
                    <div className="mb-2 d-flex gap-2 align-items-center">
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
                            className="btn btn-outline-light px-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{ height: '40px', borderRadius: '4px', fontSize: '0.78rem', opacity: hayFiltros ? 1 : 0.5 }}
                            onClick={limpiar}
                            disabled={!hayFiltros}
                            title="Limpiar filtros"
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    {/* Filtros organizados en una sola línea */}
                    <div
                        className="mb-3"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}
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
                            />
                            <datalist id="lista-anios">
                                {aniosDisponibles.map((a) => <option key={a} value={a} />)}
                            </datalist>
                        </div>

                        <select className="filtro-control" style={control} value={generoId} onChange={(e) => setGeneroId(e.target.value)}>
                            <option value="">Género</option>
                            {generos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                        </select>

                        <input
                            type="text"
                            inputMode="numeric"
                            className="filtro-control"
                            style={control}
                            placeholder="Duración máx"
                            value={duracion}
                            maxLength={3}
                            onChange={(e) => setDuracion(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        />

                        <input
                            type="text"
                            inputMode="numeric"
                            className="filtro-control"
                            style={control}
                            placeholder="DD/MM/AAAA"
                            value={fechaAgregado}
                            onChange={handleFechaChange}
                            maxLength={10}
                        />

                        <select className="filtro-control" style={control} value={pais} onChange={(e) => setPais(e.target.value)}>
                            <option value="">País</option>
                            {PAISES_DISPONIBLES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <div ref={panelRef} style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="filtro-control"
                                style={{ ...control, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                onClick={() => setPanelPlataformas((v) => !v)}
                            >
                                <span className="text-truncate">
                                    {plataformasSel.length === 0 ? 'Plataformas' : `Plataformas (${plataformasSel.length})`}
                                </span>
                                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
                            </button>
                            {panelPlataformas && (
                                <div
                                    style={{
                                        position: 'absolute', top: '44px', left: 0, right: 0, minWidth: '180px', zIndex: 60,
                                        backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px',
                                        padding: '8px 10px', maxHeight: '220px', overflowY: 'auto',
                                        boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    {PLATAFORMAS_DISPONIBLES.map((pl) => (
                                        <label key={pl} className="d-flex align-items-center gap-2 py-1 text-white" style={{ fontSize: '0.78rem', cursor: 'pointer' }}>
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
                        {filtradas.length} de {listaBase.length} películas vistas
                    </div>

                    {/* Tabla con fondo claro y encabezados solicitados */}
                    {filtradas.length > 0 ? (
                        <div className="table-responsive rounded shadow-sm" style={{ backgroundColor: '#f8f9fa', padding: '12px' }}>
                            <table className="table table-hover align-middle mb-0" style={{ color: '#212529' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #dee2e6', fontSize: '0.85rem', color: '#495057' }}>
                                        <th style={{ width: '80px' }}>Póster</th>
                                        <th>Nombre</th>
                                        <th>Género</th>
                                        <th>Plataformas</th>
                                        <th>Vista</th>
                                        <th className="text-end" style={{ width: '160px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtradas.map((pelicula) => {
                                        const plats = Array.isArray(pelicula.plataformas) ? pelicula.plataformas.join(', ') : (pelicula.plataformas || 'N/A');

                                        return (
                                            <tr key={pelicula.id} style={{ fontSize: '0.85rem' }}>
                                                <td>
                                                    <img
                                                        src={resolvePoster(pelicula.poster)}
                                                        alt={pelicula.titulo}
                                                        className="rounded shadow-sm"
                                                        style={{ width: '45px', height: '65px', objectFit: 'cover', cursor: 'pointer' }}
                                                        onClick={() => setPosterAmpliadoUrl(resolvePoster(pelicula.poster))}
                                                        title="Ampliar póster en superposición"
                                                        onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                                    />
                                                </td>
                                                <td>
                                                    <strong style={{ color: '#212529' }}>{pelicula.titulo}</strong>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Año: {pelicula.anio || 'N/A'}</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>{pelicula.genero || 'Género'}</span>
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '0.78rem' }}>{plats}</td>
                                                <td className="text-muted" style={{ fontSize: '0.78rem' }}>{pelicula.fecha_agregado || 'N/A'}</td>
                                                <td className="text-end">
                                                    <div className="d-flex align-items-center justify-content-end gap-1">
                                                        {/* Botón Ver detalles */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setAbiertaId(pelicula.id)}
                                                            className="btn btn-sm d-flex align-items-center justify-content-center text-dark shadow-sm"
                                                            style={{ backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', width: '32px', height: '32px' }}
                                                            title="Ver detalles completos"
                                                        >
                                                            <i className="fas fa-eye" style={{ fontSize: '0.8rem', color: '#2a9d8f' }}></i>
                                                        </button>
                                                        {/* Botón Eliminar / Ocultar */}
                                                        <button
                                                            type="button"
                                                            onClick={() => ocultarVista(pelicula.id)}
                                                            className="btn btn-sm d-flex align-items-center justify-content-center text-dark shadow-sm"
                                                            style={{ backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', width: '32px', height: '32px' }}
                                                            title="Eliminar / Ocultar de mis vistas"
                                                        >
                                                            <i className="fas fa-trash-alt" style={{ fontSize: '0.8rem', color: '#e63950' }}></i>
                                                        </button>
                                                        {/* Botón Generar PDF / Descargar en Acciones */}
                                                        <button
                                                            type="button"
                                                            onClick={generarPDF}
                                                            className="btn btn-sm d-flex align-items-center justify-content-center text-dark shadow-sm"
                                                            style={{ backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', width: '32px', height: '32px' }}
                                                            title="Generar PDF / Descargar"
                                                        >
                                                            <i className="fas fa-file-pdf" style={{ fontSize: '0.8rem', color: '#e63950' }}></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            No se encontraron películas vistas con esos filtros.
                        </div>
                    )}
                </div>
            </section>

            {abierta && (
                <PeliculaModal
                    pelicula={abierta}
                    onClose={() => setAbiertaId(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}