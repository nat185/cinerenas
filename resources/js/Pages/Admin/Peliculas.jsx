import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';

export default function Peliculas({ auth, peliculas = [], generos = [] }) {
    const { flash } = usePage().props;
    const listaPeliculas = Array.isArray(peliculas) ? peliculas : (peliculas?.data ?? []);

    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');

    // 'tabla' | 'nueva-peli' | 'editar-peli' | 'nuevo-genero' | 'editar-genero' | 'gestionar-generos' | 'ver-detalle'
    const [vistaActiva, setVistaActiva] = useState('tabla');

    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);
    const [generoSeleccionado, setGeneroSeleccionado] = useState(null);
    const [imagenInfo, setImagenInfo] = useState({ tipo: 'N/A', peso: 'N/A', medidas: 'N/A' });
    const [posterZoom, setPosterZoom] = useState(false);

    const [modalPoster, setModalPoster] = useState({ abierto: false, url: '', titulo: '' });
    const [mostrarInfoModal, setMostrarInfoModal] = useState(false);

    const [mostrarFlash, setMostrarFlash] = useState(false);
    const tableRef = useRef(null);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const timer = setTimeout(() => setMostrarFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const formPeli = useForm({
        titulo: '',
        genero_id: '',
        sinopsis: '',
        estado: 'publicada',
        poster: null,
    });

    const formEditPeli = useForm({
        id: '',
        titulo: '',
        genero_id: '',
        sinopsis: '',
        estado: 'publicada',
        poster: null,
    });

    const formGenero = useForm({
        nombre: '',
        descripcion: '',
    });

    const formEditGenero = useForm({
        id: '',
        nombre: '',
        descripcion: '',
    });

    // ===================== Helpers (regla de oro: nunca un objeto como fallback) =====================
    const getTitulo = (p) => p.titulo || 'Sin título';
    const getGenero = (p) => p.genero?.nombre || 'Sin género';
    const getEditor = (p) => p.editor?.nombre || 'Administrador';
    const getValoracion = (p) => p.valoracion ?? 0;
    const getEstado = (p) => p.estado || 'publicada';
    const esActivaPelicula = (p) => !(p.activa === false || p.activa === 0 || p.activa === '0' || p.estado === 'archivada');
    const esGeneroActivo = (g) => g.activo === 1 || g.activo === true || g.activo === '1';

    const getFecha = (p) => {
        if (p.fecha) return p.fecha;
        if (p.created_at) {
            const d = new Date(p.created_at);
            const dia = String(d.getDate()).padStart(2, '0');
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const anio = d.getFullYear();
            return `${dia}/${mes}/${anio}`;
        }
        return 'N/A';
    };

    const getPoster = (p) => {
        const path = p.poster_path || p.poster || p.poster_url;
        if (!path) return '/dist/assets/img/posters/default.jpg';
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    const analizarImagenPoster = (url) => {
        if (!url) {
            setImagenInfo({ tipo: 'N/A', peso: 'N/A', medidas: 'N/A' });
            return;
        }
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            let extension = url.split('.').pop().split(/[#?]/)[0].toUpperCase();
            if (!['JPG', 'JPEG', 'PNG', 'WEBP'].includes(extension)) extension = 'WEBP/JPEG';

            fetch(url)
                .then((res) => res.blob())
                .then((blob) => {
                    const sizeKB = (blob.size / 1024).toFixed(1);
                    setImagenInfo({
                        tipo: extension,
                        peso: `${sizeKB} KB`,
                        medidas: `${width} x ${height} px`,
                    });
                })
                .catch(() => {
                    setImagenInfo({
                        tipo: extension,
                        peso: 'Desconocido',
                        medidas: `${width} x ${height} px`,
                    });
                });
        };
        img.onerror = () => {
            setImagenInfo({ tipo: 'N/A', peso: 'N/A', medidas: 'N/A' });
        };
    };

    // ===================== Poster: modal estilo Editor (clic para ampliar) =====================
    const abrirModalPoster = (peli, e) => {
        e.stopPropagation();
        const url = getPoster(peli);
        analizarImagenPoster(url);
        setMostrarInfoModal(false);
        setModalPoster({ abierto: true, url, titulo: getTitulo(peli) });
    };

    const cerrarModalPoster = () => {
        setModalPoster({ abierto: false, url: '', titulo: '' });
        setMostrarInfoModal(false);
    };

    // ===================== Tabla: scroll fila por fila (misma lógica que Editor) =====================
    const scrollTable = (dir) => {
        if (tableRef.current) {
            const fila = tableRef.current.querySelector('tbody tr');
            const alturaFila = fila ? fila.offsetHeight : 48;
            tableRef.current.scrollBy({
                top: dir === 'down' ? alturaFila : -alturaFila,
                behavior: 'smooth',
            });
        }
    };

    // ===================== Películas: filtros =====================
    const handleCambioColumna = (e) => {
        setColumnaFiltro(e.target.value);
        setBusqueda('');
        setValorSelectFiltro('');
        setFechaFiltro('');
    };

    const limpiarFiltros = () => {
        setColumnaFiltro('todos');
        setBusqueda('');
        setValorSelectFiltro('');
        setFechaFiltro('');
    };

    const peliculasFiltradas = listaPeliculas.filter((p) => {
        const titulo = getTitulo(p);
        const genero = getGenero(p);
        const editor = getEditor(p);
        const estado = getEstado(p);
        const fecha = getFecha(p);
        const valoracion = getValoracion(p);

        if (columnaFiltro === 'genero' || columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return columnaFiltro === 'genero'
                ? String(p.genero_id) === String(valorSelectFiltro)
                : estado.toLowerCase() === valorSelectFiltro.toLowerCase();
        }
        if (columnaFiltro === 'fecha') {
            if (!fechaFiltro) return true;
            return fecha.includes(fechaFiltro);
        }
        const val = busqueda.toLowerCase().trim();
        if (!val) return true;
        switch (columnaFiltro) {
            case 'titulo':
                return titulo.toLowerCase().includes(val);
            case 'editor':
                return editor.toLowerCase().includes(val);
            case 'valoracion':
                return String(valoracion).includes(val);
            default:
                return (
                    titulo.toLowerCase().includes(val) ||
                    genero.toLowerCase().includes(val) ||
                    editor.toLowerCase().includes(val) ||
                    fecha.toLowerCase().includes(val) ||
                    String(valoracion).includes(val) ||
                    estado.toLowerCase().includes(val)
                );
        }
    });

    // ===================== Películas: CRUD =====================
    const handleSavePelicula = (e) => {
        e.preventDefault();
        formPeli.post(route('admin.peliculas.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                formPeli.reset();
                setVistaActiva('tabla');
            },
            onError: (errors) => {
                if (errors.titulo) formPeli.setError('titulo', errors.titulo);
            },
        });
    };

    const handleUpdatePelicula = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('titulo', formEditPeli.data.titulo);
        formData.append('genero_id', formEditPeli.data.genero_id);
        formData.append('sinopsis', formEditPeli.data.sinopsis || '');
        formData.append('estado', formEditPeli.data.estado);
        if (formEditPeli.data.poster) {
            formData.append('poster', formEditPeli.data.poster);
        }
        router.post(route('admin.peliculas.update', formEditPeli.data.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setVistaActiva('tabla'),
            onError: (errors) => {
                if (errors.titulo) formEditPeli.setError('titulo', errors.titulo);
            },
        });
    };

    const handleVerDetalle = (peli) => {
        setPeliculaSeleccionada(peli);
        setPosterZoom(false);
        analizarImagenPoster(getPoster(peli));
        setVistaActiva('ver-detalle');
    };

    const handleEditarPelicula = (peli) => {
        setPeliculaSeleccionada(peli);
        formEditPeli.setData({
            id: peli.id,
            titulo: peli.titulo || '',
            genero_id: peli.genero_id || '',
            sinopsis: peli.sinopsis || '',
            estado: (peli.estado || 'publicada').toLowerCase(),
            poster: null,
        });
        setVistaActiva('editar-peli');
    };

    const handleToggleEstado = (peli) => {
        const activa = esActivaPelicula(peli);
        if (confirm(`¿Deseas ${activa ? 'archivar e inhabilitar' : 'reactivar y publicar'} "${getTitulo(peli)}"?`)) {
            router.delete(route('admin.peliculas.destroy', peli.id), { preserveScroll: true, preserveState: true });
        }
    };

    // ===================== Géneros: CRUD =====================
    const handleNombreGeneroChange = (e, isEdit = false) => {
        const valor = e.target.value;
        if (valor === '' || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            if (isEdit) formEditGenero.setData('nombre', valor);
            else formGenero.setData('nombre', valor);
        }
    };

    const handleSaveGenero = (e) => {
        e.preventDefault();
        formGenero.post(route('admin.generos.store'), {
            preserveScroll: true,
            onSuccess: () => {
                formGenero.reset();
                setVistaActiva('gestionar-generos');
            },
            onError: (errors) => {
                if (errors.nombre) formGenero.setError('nombre', errors.nombre);
            },
        });
    };

    const handleEditarGenero = (genero) => {
        setGeneroSeleccionado(genero);
        formEditGenero.setData({
            id: genero.id,
            nombre: genero.nombre || '',
            descripcion: genero.descripcion || '',
        });
        setVistaActiva('editar-genero');
    };

    const handleUpdateGenero = (e) => {
        e.preventDefault();
        formEditGenero.transform((data) => ({ ...data, _method: 'PUT' })).post(
            route('admin.generos.update', formEditGenero.data.id),
            {
                preserveScroll: true,
                onSuccess: () => setVistaActiva('gestionar-generos'),
                onError: (errors) => {
                    if (errors.nombre) formEditGenero.setError('nombre', errors.nombre);
                },
            }
        );
    };

    const handleToggleGenero = (genero) => {
        const activo = esGeneroActivo(genero);
        if (confirm(`¿Deseas ${activo ? 'deshabilitar' : 'habilitar'} el género "${genero.nombre}"?`)) {
            router.delete(route('admin.generos.destroy', genero.id), { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout auth={auth} title="Películas y Reseñas">
            {/* Flash de éxito/error */}
            {mostrarFlash && (flash?.message || flash?.error) && (
                <div
                    className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.8rem', borderRadius: '4px', maxWidth: '380px' }}
                >
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setMostrarFlash(false)}></button>
                </div>
            )}

            {/* Modal de póster ampliado (idéntico al de Editor/Peliculas.jsx) */}
            {modalPoster.abierto && (
                <div
                    onClick={cerrarModalPoster}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(3px)',
                        padding: '20px',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            padding: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <button
                            type="button"
                            onClick={cerrarModalPoster}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ced4da',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                color: '#333',
                                cursor: 'pointer',
                                zIndex: 10,
                            }}
                            title="Cerrar"
                        >
                            &times;
                        </button>

                        <h5 className="mb-3 text-dark fw-bold" style={{ fontSize: '1rem', paddingRight: '30px' }}>
                            {modalPoster.titulo}
                        </h5>

                        <div
                            style={{ position: 'relative', display: 'inline-block' }}
                            onMouseEnter={() => setMostrarInfoModal(true)}
                            onMouseLeave={() => setMostrarInfoModal(false)}
                        >
                            <img
                                src={modalPoster.url}
                                alt={modalPoster.titulo}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '65vh',
                                    objectFit: 'contain',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6',
                                    cursor: 'crosshair',
                                }}
                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                            />

                            {mostrarInfoModal && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        right: '10px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        color: '#000',
                                        border: '1px solid rgba(255, 255, 255, 0.9)',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        fontSize: '0.78rem',
                                        textAlign: 'left',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        zIndex: 5,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="fw-bold text-dark border-bottom pb-1 mb-1">
                                        <i className="fas fa-info-circle text-primary me-1"></i> Especificaciones de la Imagen
                                    </div>
                                    <div><strong>Formato:</strong> {imagenInfo.tipo}</div>
                                    <div><strong>Medidas:</strong> {imagenInfo.medidas}</div>
                                    <div><strong>Peso:</strong> {imagenInfo.peso}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <section
                style={{
                    position: 'relative', minHeight: '180px', paddingTop: '20px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 45%',
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>
                        Películas y Reseñas
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Administra el catálogo de películas, controla géneros y supervisa reseñas y valoraciones de la plataforma.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 180px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* Filtros + botones (estilo Editor) */}
                    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
                        <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ width: '170px', fontSize: '0.8rem' }}
                                value={columnaFiltro}
                                onChange={handleCambioColumna}
                            >
                                <option value="todos">Filtrar por...</option>
                                <option value="titulo">Título</option>
                                <option value="genero">Género</option>
                                <option value="editor">Editor</option>
                                <option value="fecha">Fecha (DD/MM/AAAA)</option>
                                <option value="valoracion">Valoración</option>
                                <option value="estado">Estado</option>
                            </select>

                            {columnaFiltro === 'genero' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ width: '200px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione género...</option>
                                    {generos.filter(esGeneroActivo).map((g) => (
                                        <option key={g.id} value={g.id}>{g.nombre}</option>
                                    ))}
                                </select>
                            ) : columnaFiltro === 'estado' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ width: '200px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione estado...</option>
                                    <option value="publicada">Publicada</option>
                                    <option value="borrador">Borrador</option>
                                    <option value="archivada">Archivada</option>
                                </select>
                            ) : columnaFiltro === 'fecha' ? (
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-white text-dark border"
                                    style={{ width: '200px', fontSize: '0.8rem' }}
                                    placeholder="DD/MM/AAAA"
                                    value={fechaFiltro}
                                    onChange={(e) => setFechaFiltro(e.target.value)}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-white text-dark border"
                                    style={{ width: '220px', fontSize: '0.8rem' }}
                                    placeholder={columnaFiltro !== 'todos' ? `Buscar por ${columnaFiltro}...` : 'Buscar en catálogo...'}
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            )}

                            {(busqueda || valorSelectFiltro || fechaFiltro || columnaFiltro !== 'todos') && (
                                <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                    <i className="fas fa-times me-1"></i>Limpiar
                                </button>
                            )}
                        </div>

                        <div className="d-flex gap-2">
                            <div className="btn-group btn-group-sm" role="group">
                                <button className="btn btn-sm btn-light border" type="button" onClick={() => scrollTable('up')} style={{ height: '31px' }}>
                                    <i className="fas fa-chevron-up"></i>
                                </button>
                                <button className="btn btn-sm btn-light border" type="button" onClick={() => scrollTable('down')} style={{ height: '31px' }}>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-dark d-flex align-items-center px-3"
                                style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }}
                                onClick={() => setVistaActiva('gestionar-generos')}
                            >
                                <i className="fas fa-tags me-2"></i>Gestionar Géneros
                            </button>
                            <button
                                className="btn btn-sm btn-dark d-flex align-items-center px-3"
                                style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }}
                                onClick={() => { formGenero.reset(); setVistaActiva('nuevo-genero'); }}
                            >
                                <i className="fas fa-plus me-2"></i>Nuevo Género
                            </button>
                            <button
                                className="btn btn-sm btn-primary d-flex align-items-center px-3"
                                style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }}
                                onClick={() => { formPeli.reset(); setVistaActiva('nueva-peli'); }}
                            >
                                <i className="fas fa-plus me-2"></i>Nueva Película
                            </button>
                        </div>
                    </div>

                    {/* ===================== VISTA: DETALLE COMPLETO DE PELÍCULA ===================== */}
                    {vistaActiva === 'ver-detalle' && peliculaSeleccionada && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                                    <i className="fas fa-eye me-2 text-secondary"></i>Detalles de Película: <span className="text-primary">{getTitulo(peliculaSeleccionada)}</span>
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar
                                </button>
                            </div>

                            <div className="row g-4 align-items-start">
                                {/* Póster con zoom in-line (igual a Editor) */}
                                <div className="col-md-3 text-center d-flex flex-column align-items-center">
                                    <div
                                        style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
                                        onClick={() => {
                                            if (!posterZoom) analizarImagenPoster(getPoster(peliculaSeleccionada));
                                            setPosterZoom(!posterZoom);
                                        }}
                                        title={posterZoom ? 'Clic para cerrar zoom' : 'Clic para ampliar imagen'}
                                    >
                                        <img
                                            src={getPoster(peliculaSeleccionada)}
                                            alt={getTitulo(peliculaSeleccionada)}
                                            style={{
                                                width: posterZoom ? '250px' : '180px',
                                                height: posterZoom ? '360px' : '260px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                border: '2px solid #fff',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s ease',
                                            }}
                                            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                        />
                                        {posterZoom && (
                                            <div
                                                style={{
                                                    position: 'absolute', top: '8px', left: '8px', right: '8px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#000',
                                                    border: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: '4px',
                                                    padding: '8px 10px', fontSize: '0.72rem', textAlign: 'left',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10,
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-1 border-bottom pb-1">
                                                    <span className="fw-bold text-dark"><i className="fas fa-info-circle text-primary me-1"></i> Especificaciones</span>
                                                    <button type="button" className="btn-close" style={{ fontSize: '0.5rem' }} onClick={() => setPosterZoom(false)} title="Cerrar"></button>
                                                </div>
                                                <div><strong>Formato:</strong> {imagenInfo.tipo}</div>
                                                <div><strong>Medidas:</strong> {imagenInfo.medidas}</div>
                                                <div><strong>Peso:</strong> {imagenInfo.peso}</div>
                                            </div>
                                        )}
                                    </div>
                                    <small className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                                        <i className="fas fa-search-plus me-1"></i>{posterZoom ? 'Clic para cerrar zoom' : 'Clic para ampliar póster'}
                                    </small>
                                </div>

                                <div className="col-md-9">
                                    {/* Todos los campos de la tabla peliculas */}
                                    <div className="row g-2 mb-3" style={{ fontSize: '0.86rem' }}>
                                        <div className="col-sm-6">
                                            <p className="mb-1 text-dark"><strong>ID:</strong> #{peliculaSeleccionada.id}</p>
                                            <p className="mb-1 text-dark"><strong>Título:</strong> {getTitulo(peliculaSeleccionada)}</p>
                                            <p className="mb-1 text-dark"><strong>Género (ID {peliculaSeleccionada.genero_id ?? 'N/A'}):</strong> <span className="badge bg-secondary">{getGenero(peliculaSeleccionada)}</span></p>
                                            <p className="mb-1 text-dark"><strong>Editor (ID {peliculaSeleccionada.editor_id ?? 'N/A'}):</strong> {getEditor(peliculaSeleccionada)}</p>
                                            <p className="mb-1 text-dark"><strong>Año:</strong> {peliculaSeleccionada.anio || 'N/A'}</p>
                                            <p className="mb-1 text-dark"><strong>Director:</strong> {peliculaSeleccionada.director || 'No especificado'}</p>
                                            <p className="mb-1 text-dark"><strong>Duración:</strong> {peliculaSeleccionada.duracion_min ? `${peliculaSeleccionada.duracion_min} min` : 'N/A'}</p>
                                        </div>
                                        <div className="col-sm-6">
                                            <p className="mb-1 text-dark"><strong>País:</strong> {peliculaSeleccionada.pais || 'N/A'}</p>
                                            <p className="mb-1 text-dark"><strong>Estado:</strong> <span className="badge bg-secondary">{getEstado(peliculaSeleccionada)}</span></p>
                                            <p className="mb-1 text-dark"><strong>Activa:</strong> <span className={`badge bg-${esActivaPelicula(peliculaSeleccionada) ? 'success' : 'danger'}`}>{esActivaPelicula(peliculaSeleccionada) ? 'Sí' : 'No'}</span></p>
                                            <p className="mb-1 text-dark"><strong>Fecha de registro:</strong> {getFecha(peliculaSeleccionada)}</p>
                                            {peliculaSeleccionada.trailer_url && (
                                                <p className="mb-1 text-dark">
                                                    <strong>Tráiler:</strong>{' '}
                                                    <a href={peliculaSeleccionada.trailer_url} target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-primary">
                                                        Ver video
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
                                        <p className="mb-1 text-dark"><strong><i className="fas fa-users me-1 text-primary"></i> Elenco:</strong></p>
                                        <p className="mb-0 text-muted">{peliculaSeleccionada.elenco || 'No se registró elenco detallado.'}</p>
                                    </div>

                                    <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
                                        <p className="mb-1 text-dark"><strong><i className="fas fa-tv me-1 text-danger"></i> Plataformas de Streaming:</strong></p>
                                        <p className="mb-0 text-muted">
                                            {Array.isArray(peliculaSeleccionada.plataformas_streaming) && peliculaSeleccionada.plataformas_streaming.length > 0
                                                ? peliculaSeleccionada.plataformas_streaming.join(', ')
                                                : (typeof peliculaSeleccionada.plataformas_streaming === 'string' && peliculaSeleccionada.plataformas_streaming
                                                    ? peliculaSeleccionada.plataformas_streaming
                                                    : 'No disponible en plataformas digitales')}
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-dark fw-bold mb-1" style={{ fontSize: '0.88rem' }}><i className="fas fa-book-open me-1 text-secondary"></i> Sinopsis:</p>
                                        <p className="text-dark fst-italic mb-0" style={{ fontSize: '0.86rem', lineHeight: '1.5' }}>
                                            "{peliculaSeleccionada.sinopsis || 'Sin descripción detallada registrada para esta película.'}"
                                        </p>
                                    </div>

                                    <hr className="my-3" />

                                    {/* Reseña asociada */}
                                    <div className="mb-3">
                                        <p className="text-dark fw-bold mb-2" style={{ fontSize: '0.92rem' }}>
                                            <i className="fas fa-pen-nib me-1 text-info"></i> Reseña asociada
                                        </p>
                                        {peliculaSeleccionada.resena_asociada ? (
                                            <div className="p-3 bg-light rounded border" style={{ fontSize: '0.85rem' }}>
                                                <p className="mb-1 text-dark"><strong>ID de Reseña:</strong> #{peliculaSeleccionada.resena_asociada.id}</p>
                                                <p className="mb-1 text-dark"><strong>Película (ID):</strong> {peliculaSeleccionada.resena_asociada.pelicula_id}</p>
                                                <p className="mb-1 text-dark"><strong>Editor (ID):</strong> {peliculaSeleccionada.resena_asociada.editor_id}</p>
                                                <p className="mb-1 text-dark"><strong>Título de la Reseña:</strong> {peliculaSeleccionada.resena_asociada.titulo}</p>
                                                <p className="mb-1 text-dark"><strong>Estado:</strong> <span className="badge bg-secondary">{peliculaSeleccionada.resena_asociada.estado}</span></p>
                                                <p className="mb-0 text-dark"><strong>Contenido:</strong></p>
                                                <p className="mb-0 text-muted fst-italic">"{peliculaSeleccionada.resena_asociada.contenido}"</p>
                                            </div>
                                        ) : (
                                            <span className="badge bg-warning text-dark">Esta película aún no tiene reseña registrada en la base de datos.</span>
                                        )}
                                    </div>

                                    {/* Valoración combinada (distingue valoraciones a la película vs. a la reseña) */}
                                    <div className="p-3 rounded border" style={{ fontSize: '0.85rem', backgroundColor: '#fff8e1' }}>
                                        <p className="mb-2 text-dark fw-bold">
                                            <i className="fas fa-star me-1 text-warning"></i> Valoración Promedio: <span className="text-warning">★ {getValoracion(peliculaSeleccionada)}</span>
                                        </p>
                                        <p className="mb-1 text-muted" style={{ fontSize: '0.78rem' }}>{peliculaSeleccionada.valoracion_origen}</p>
                                        <div className="row g-2 mt-1" style={{ fontSize: '0.78rem' }}>
                                            <div className="col-6">
                                                <strong>Valoraciones a la película:</strong><br />
                                                ★ {peliculaSeleccionada.valoracion_pelicula_promedio ?? 0} ({peliculaSeleccionada.valoracion_pelicula_total ?? 0} voto(s))
                                            </div>
                                            <div className="col-6">
                                                <strong>Valoraciones a la reseña:</strong><br />
                                                ★ {peliculaSeleccionada.valoracion_resena_promedio ?? 0} ({peliculaSeleccionada.valoracion_resena_total ?? 0} voto(s))
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===================== VISTA: GESTIONAR GÉNEROS ===================== */}
                    {vistaActiva === 'gestionar-generos' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                                    <i className="fas fa-tags me-2 text-dark"></i>Gestión de Géneros
                                </h4>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-dark px-3" onClick={() => { formGenero.reset(); setVistaActiva('nuevo-genero'); }} style={{ fontSize: '0.8rem' }}>
                                        <i className="fas fa-plus me-1"></i>Nuevo Género
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}>
                                        <i className="fas fa-arrow-left me-1"></i> Regresar
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '60px' }}>ID</th>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center" style={{ width: '140px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generos.length > 0 ? (
                                            generos.map((g) => {
                                                const activo = esGeneroActivo(g);
                                                return (
                                                    <tr key={g.id} style={{ opacity: activo ? 1 : 0.55, backgroundColor: activo ? 'transparent' : '#f8f9fa' }}>
                                                        <td className="fw-bold text-muted">#{g.id}</td>
                                                        <td className="fw-semibold text-dark">{g.nombre}</td>
                                                        <td className="text-muted">{g.descripcion || 'Sin descripción.'}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`}>{activo ? 'Activo' : 'Inactivo'}</span>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button className="btn btn-outline-primary" onClick={() => handleEditarGenero(g)} title="Editar Género" style={{ padding: '2px 8px', borderRadius: '2px 0 0 2px' }}>
                                                                    <i className="fas fa-pen"></i>
                                                                </button>
                                                                <button
                                                                    className={`btn ${activo ? 'btn-outline-danger' : 'btn-success'}`}
                                                                    onClick={() => handleToggleGenero(g)}
                                                                    title={activo ? 'Deshabilitar Género' : 'Habilitar Género'}
                                                                    style={{ padding: '2px 8px', borderRadius: '0 2px 2px 0' }}
                                                                >
                                                                    <i className={`fas ${activo ? 'fa-ban' : 'fa-check'}`}></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-muted">No hay géneros registrados en el sistema.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===================== VISTA: NUEVA PELÍCULA ===================== */}
                    {vistaActiva === 'nueva-peli' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #0d6efd' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-film me-2 text-primary"></i>Registrar Nueva Película
                                </h4>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setVistaActiva('tabla')}>Cancelar</button>
                            </div>
                            <form onSubmit={handleSavePelicula}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Título de la Película</label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-sm ${formPeli.errors.titulo ? 'is-invalid' : ''}`}
                                        value={formPeli.data.titulo}
                                        onChange={(e) => formPeli.setData('titulo', e.target.value)}
                                        required
                                    />
                                    {formPeli.errors.titulo && (
                                        <div className="text-danger small mt-1" style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>
                                            {formPeli.errors.titulo}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Género</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={formPeli.data.genero_id}
                                        onChange={(e) => formPeli.setData('genero_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccionar género...</option>
                                        {generos.filter(esGeneroActivo).map((g) => (
                                            <option key={g.id} value={g.id}>{g.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Sinopsis</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="3"
                                        value={formPeli.data.sinopsis}
                                        onChange={(e) => formPeli.setData('sinopsis', e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Estado</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={formPeli.data.estado}
                                        onChange={(e) => formPeli.setData('estado', e.target.value)}
                                    >
                                        <option value="publicada">Publicada</option>
                                        <option value="borrador">Borrador</option>
                                        <option value="archivada">Archivada</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Póster (Imagen)</label>
                                    <input
                                        type="file"
                                        className="form-control form-control-sm"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => formPeli.setData('poster', e.target.files[0])}
                                    />
                                </div>
                                <button type="submit" className="btn btn-sm btn-primary" disabled={formPeli.processing}>
                                    {formPeli.processing ? 'Guardando...' : 'Guardar Película'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ===================== VISTA: EDITAR PELÍCULA ===================== */}
                    {vistaActiva === 'editar-peli' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #198754' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-edit me-2 text-success"></i>Editar Película
                                </h4>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setVistaActiva('tabla')}>Cancelar</button>
                            </div>
                            <form onSubmit={handleUpdatePelicula}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Título de la Película</label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-sm ${formEditPeli.errors.titulo ? 'is-invalid' : ''}`}
                                        value={formEditPeli.data.titulo}
                                        onChange={(e) => formEditPeli.setData('titulo', e.target.value)}
                                        required
                                    />
                                    {formEditPeli.errors.titulo && (
                                        <div className="text-danger small mt-1" style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>
                                            {formEditPeli.errors.titulo}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Género</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={formEditPeli.data.genero_id}
                                        onChange={(e) => formEditPeli.setData('genero_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccionar género...</option>
                                        {generos.map((g) => (
                                            <option key={g.id} value={g.id}>{g.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Sinopsis</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="3"
                                        value={formEditPeli.data.sinopsis}
                                        onChange={(e) => formEditPeli.setData('sinopsis', e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Estado</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={formEditPeli.data.estado}
                                        onChange={(e) => formEditPeli.setData('estado', e.target.value)}
                                    >
                                        <option value="publicada">Publicada</option>
                                        <option value="borrador">Borrador</option>
                                        <option value="archivada">Archivada</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Nuevo Póster (Opcional)</label>
                                    <input
                                        type="file"
                                        className="form-control form-control-sm"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => formEditPeli.setData('poster', e.target.files[0])}
                                    />
                                </div>
                                <button type="submit" className="btn btn-sm btn-success" disabled={formEditPeli.processing}>
                                    {formEditPeli.processing ? 'Actualizando...' : 'Actualizar Película'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ===================== VISTA: NUEVO GÉNERO ===================== */}
                    {vistaActiva === 'nuevo-genero' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #1a1d20' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-tags me-2 text-dark"></i>Registrar Nuevo Género
                                </h4>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setVistaActiva('gestionar-generos')}>Cancelar</button>
                            </div>
                            <form onSubmit={handleSaveGenero}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Nombre del Género (Solo letras)</label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-sm ${formGenero.errors.nombre ? 'is-invalid' : ''}`}
                                        value={formGenero.data.nombre}
                                        onChange={(e) => handleNombreGeneroChange(e, false)}
                                        required
                                    />
                                    {formGenero.errors.nombre && (
                                        <div className="text-danger small mt-1" style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>
                                            {formGenero.errors.nombre}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Descripción</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="2"
                                        value={formGenero.data.descripcion}
                                        onChange={(e) => formGenero.setData('descripcion', e.target.value)}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-sm btn-dark" disabled={formGenero.processing}>
                                    {formGenero.processing ? 'Guardando...' : 'Guardar Género'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ===================== VISTA: EDITAR GÉNERO ===================== */}
                    {vistaActiva === 'editar-genero' && generoSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #ffc107' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-edit me-2 text-warning"></i>Editar Género: {generoSeleccionado.nombre}
                                </h4>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setVistaActiva('gestionar-generos')}>Cancelar</button>
                            </div>
                            <form onSubmit={handleUpdateGenero}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Nombre del Género (Solo letras)</label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-sm ${formEditGenero.errors.nombre ? 'is-invalid' : ''}`}
                                        value={formEditGenero.data.nombre}
                                        onChange={(e) => handleNombreGeneroChange(e, true)}
                                        required
                                    />
                                    {formEditGenero.errors.nombre && (
                                        <div className="text-danger small mt-1" style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>
                                            {formEditGenero.errors.nombre}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Descripción</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="2"
                                        value={formEditGenero.data.descripcion}
                                        onChange={(e) => formEditGenero.setData('descripcion', e.target.value)}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-sm btn-warning" disabled={formEditGenero.processing}>
                                    {formEditGenero.processing ? 'Actualizando...' : 'Actualizar Género'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ===================== TABLA PRINCIPAL DE PELÍCULAS ===================== */}
                    {vistaActiva === 'tabla' && (
                        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '4px' }}>
                            <div ref={tableRef} className="table-responsive" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th style={{ width: '60px' }}>ID</th>
                                            <th style={{ width: '70px' }} className="text-center">Póster</th>
                                            <th>Título</th>
                                            <th>Género</th>
                                            <th>Editor</th>
                                            <th>Fecha</th>
                                            <th>Valoración</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center" style={{ width: '130px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {peliculasFiltradas.length > 0 ? (
                                            peliculasFiltradas.map((p) => {
                                                const activa = esActivaPelicula(p);
                                                return (
                                                    <tr key={p.id} style={{ opacity: activa ? 1 : 0.55, backgroundColor: activa ? 'transparent' : '#f8f9fa' }}>
                                                        <td className="fw-bold text-muted">#{p.id}</td>
                                                        <td className="text-center">
                                                            <img
                                                                src={getPoster(p)}
                                                                alt={getTitulo(p)}
                                                                onClick={(e) => abrirModalPoster(p, e)}
                                                                style={{
                                                                    width: '38px',
                                                                    height: '52px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '2px',
                                                                    border: '1px solid #ced4da',
                                                                    cursor: 'pointer',
                                                                }}
                                                                title="Clic para ampliar póster"
                                                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                                            />
                                                        </td>
                                                        <td className="fw-semibold text-dark">{getTitulo(p)}</td>
                                                        <td><span className="badge bg-secondary">{getGenero(p)}</span></td>
                                                        <td className="text-muted">{getEditor(p)}</td>
                                                        <td className="text-muted">{getFecha(p)}</td>
                                                        <td><span className="text-warning">★ {getValoracion(p)}</span></td>
                                                        <td className="text-center">
                                                            <span className={`badge ${getEstado(p) === 'publicada' ? 'bg-secondary' : 'bg-dark'}`}>{getEstado(p)}</span>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button className="btn btn-outline-secondary" onClick={() => handleVerDetalle(p)} title="Ver Detalle Completo" style={{ padding: '2px 6px', borderRadius: '2px 0 0 2px' }}>
                                                                    <i className="fas fa-eye"></i>
                                                                </button>
                                                                <button className="btn btn-outline-primary" onClick={() => handleEditarPelicula(p)} title="Editar Película" style={{ padding: '2px 6px' }}>
                                                                    <i className="fas fa-pen"></i>
                                                                </button>
                                                                <button
                                                                    className={`btn ${activa ? 'btn-outline-danger' : 'btn-success'}`}
                                                                    onClick={() => handleToggleEstado(p)}
                                                                    title={activa ? 'Desactivar / Archivar' : 'Reactivar Película'}
                                                                    style={{ padding: '2px 6px', borderRadius: '0 2px 2px 0' }}
                                                                >
                                                                    <i className={`fas ${activa ? 'fa-trash-alt' : 'fa-undo'}`}></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="text-center py-4 text-muted">
                                                    <i className="fas fa-film fa-2x mb-2 d-block opacity-50"></i>
                                                    No se encontraron películas registradas en el catálogo.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}