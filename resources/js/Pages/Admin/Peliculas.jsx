import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StatusBadge } from '@/Components/AdminWidgets';
import { useForm, router, usePage } from '@inertiajs/react';

export default function Peliculas({
    auth,
    peliculas = [],
    generos = []
}) {
    const { flash } = usePage().props;
    const listaPeliculas = Array.isArray(peliculas) ? peliculas : (peliculas?.data ?? []);

    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' | 'nueva-peli' | 'nuevo-gen' | 'gestionar-generos' | 'ver-detalle' | 'editar-peli'
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

    // Notificación flotante
    const [mostrarFlash, setMostrarFlash] = useState(false);
    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const timer = setTimeout(() => setMostrarFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const formPeli = useForm({
        titulo: '',
        genero_id: '',
        sinopsis: '',
        valoracion: '',
        estado: 'publicada',
        poster: null,
    });

    const formEditPeli = useForm({
        id: '',
        titulo: '',
        genero_id: '',
        sinopsis: '',
        valoracion: '',
        estado: 'publicada',
    });

    const formGenero = useForm({
        nombre: '',
        descripcion: '',
    });

    const tableContainerRef = useRef(null);

    const scrollTable = (direction) => {
        if (tableContainerRef.current) {
            const scrollAmount = 200;
            tableContainerRef.current.scrollBy({
                top: direction === 'down' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleSavePelicula = (e) => {
        e.preventDefault();
        formPeli.post(route('admin.peliculas.store'), {
            forceFormData: true,
            onSuccess: () => {
                formPeli.reset();
                setVistaActiva('tabla');
            },
        });
    };

    const handleUpdatePelicula = (e) => {
        e.preventDefault();
        formEditPeli.put(route('admin.peliculas.update', formEditPeli.data.id), {
            onSuccess: () => {
                setVistaActiva('tabla');
            },
        });
    };

    const handleNombreGeneroChange = (e) => {
        const valor = e.target.value;
        if (valor === '' || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            formGenero.setData('nombre', valor);
        }
    };

    const handleSaveGenero = (e) => {
        e.preventDefault();
        formGenero.post(route('admin.generos.store'), {
            onSuccess: () => {
                formGenero.reset();
                setVistaActiva('tabla');
            },
        });
    };

    const handleToggleGenero = (gen) => {
        const activo = gen.activo !== false && gen.activo !== 0 && gen.activo !== '0';
        const accion = activo ? 'desactivar (ocultar)' : 'restaurar';
        if (confirm(`¿Deseas ${accion} el género "${gen.nombre}"?`)) {
            router.delete(route('admin.generos.destroy', gen.id), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const esPeliculaActiva = (p) => {
        if (p.activa === false || p.activa === 0 || p.activa === '0') return false;
        const estado = (p.estado || '').toLowerCase();
        if (estado === 'archivada' || estado === 'inactiva') return false;
        return true;
    };

    const handleToggleEstado = (peli) => {
        const activa = esPeliculaActiva(peli);
        const accion = activa ? 'desactivar y archivar' : 'reactivar y hacer visible';
        if (confirm(`¿Deseas ${accion} la película "${peli.titulo || peli.name}"?`)) {
            router.delete(route('admin.peliculas.destroy', peli.id), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleVerDetalle = (peli) => {
        setPeliculaSeleccionada(peli);
        setVistaActiva('ver-detalle');
    };

    const handleEditarPelicula = (peli) => {
        setPeliculaSeleccionada(peli);
        formEditPeli.setData({
            id: peli.id,
            titulo: peli.titulo || '',
            genero_id: peli.genero_id || '',
            sinopsis: peli.sinopsis || peli.resena || '',
            valoracion: peli.valoracion || peli.calificacion || '',
            estado: (peli.estado || 'publicada').toLowerCase(),
        });
        setVistaActiva('editar-peli');
    };

    const handleCambioColumna = (e) => {
        setColumnaFiltro(e.target.value);
        setBusqueda('');
        setValorSelectFiltro('');
        setFechaFiltro('');
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setValorSelectFiltro('');
        setFechaFiltro('');
    };

    const getTitulo = (p) => p.titulo || p.name || 'Sin título';
    const getGenero = (p) => p.genero?.nombre || p.genero || 'Sin género';
    const getEditor = (p) => p.editor?.name || p.editorNombre || p.editor || 'Sistema';
    const getValoracion = (p) => p.valoracion ?? p.calificacion ?? p.resenas_avg_calificacion ?? 0;
    const getEstado = (p) => p.estado || (esPeliculaActiva(p) ? 'publicada' : 'archivada');
    const getFecha = (p) => p.fecha || (p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A');
    const getPoster = (p) => p.poster_path || p.poster || p.poster_url || '/dist/assets/img/posters/default.jpg';

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
                ? genero.toLowerCase() === valorSelectFiltro.toLowerCase()
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

    return (
        <AuthenticatedLayout auth={auth} title="Películas y Reseñas">
            {/* NOTIFICACIÓN FLOTANTE */}
            {mostrarFlash && (flash?.message || flash?.error) && (
                <div
                    className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.8rem', borderRadius: '4px', maxWidth: '320px' }}
                >
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setMostrarFlash(false)}></button>
                </div>
            )}

            {/* HERO PRINCIPAL */}
            <section
                style={{
                    position: 'relative', minHeight: '180px', paddingTop: '20px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 45%'
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>
                        Películas y Reseñas
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Apartado de administración general para gestionar el catálogo de películas, calificar producciones cinematográficas, moderar reseñas y estructurar los géneros disponibles en la plataforma.
                    </p>
                </div>
            </section>

            {/* SECCIÓN PRINCIPAL */}
            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* BARRA DE BÚSQUEDA Y ACCIONES */}
                    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
                        <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ maxWidth: '170px', fontSize: '0.8rem' }}
                                value={columnaFiltro}
                                onChange={handleCambioColumna}
                            >
                                <option value="todos">Filtrar por...</option>
                                <option value="titulo">Título</option>
                                <option value="genero">Género</option>
                                <option value="editor">Editor</option>
                                <option value="fecha">Fecha</option>
                                <option value="valoracion">Valoración</option>
                                <option value="estado">Estado</option>
                            </select>

                            {columnaFiltro === 'genero' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Todos los géneros</option>
                                    {generos.map(g => (
                                        <option key={g.id} value={g.nombre}>{g.nombre}</option>
                                    ))}
                                </select>
                            ) : columnaFiltro === 'estado' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="publicada">Publicada</option>
                                    <option value="borrador">Borrador</option>
                                    <option value="archivada">Archivada</option>
                                </select>
                            ) : columnaFiltro === 'fecha' ? (
                                <div className="input-group input-group-sm" style={{ maxWidth: '220px' }}>
                                    <span className="input-group-text bg-white border text-muted" style={{ fontSize: '0.8rem' }}>
                                        <i className="fas fa-calendar-alt"></i>
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control bg-white text-dark border"
                                        value={fechaFiltro}
                                        onChange={(e) => setFechaFiltro(e.target.value)}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                </div>
                            ) : (
                                <div className="input-group input-group-sm" style={{ maxWidth: '260px' }}>
                                    <span className="input-group-text bg-white border text-muted" style={{ fontSize: '0.8rem' }}>
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-white text-dark border"
                                        placeholder={columnaFiltro === 'todos' ? 'Buscar...' : `Buscar por ${columnaFiltro}...`}
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                </div>
                            )}

                            {(busqueda || valorSelectFiltro || fechaFiltro) && (
                                <button className="btn btn-sm btn-outline-secondary" onClick={limpiarFiltros} style={{ fontSize: '0.75rem', borderRadius: '4px' }}>
                                    <i className="fas fa-times me-1"></i>Limpiar
                                </button>
                            )}
                        </div>

                        <div className="d-flex flex-wrap gap-2 align-items-center">
                            <div className="btn-group btn-group-sm me-1" role="group">
                                <button className="btn btn-sm btn-light border" onClick={() => scrollTable('up')} title="Desplazar tabla arriba" style={{ height: '31px' }}>
                                    <i className="fas fa-chevron-up"></i>
                                </button>
                                <button className="btn btn-sm btn-light border" onClick={() => scrollTable('down')} title="Desplazar tabla abajo" style={{ height: '31px' }}>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                            </div>

                            <button className="btn btn-sm btn-primary d-flex align-items-center px-3" style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }} onClick={() => setVistaActiva('nueva-peli')}>
                                <i className="fas fa-plus me-2"></i>Nueva película
                            </button>
                            <button className="btn btn-sm btn-dark d-flex align-items-center px-3" style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }} onClick={() => setVistaActiva('nuevo-gen')}>
                                <i className="fas fa-folder-plus me-2"></i>Nuevo género
                            </button>
                            <button className="btn btn-sm btn-outline-dark d-flex align-items-center px-3" style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }} onClick={() => setVistaActiva('gestionar-generos')}>
                                <i className="fas fa-tags me-2"></i>Gestionar Géneros
                            </button>
                        </div>
                    </div>

                    {/* GESTIONAR GÉNEROS */}
                    {vistaActiva === 'gestionar-generos' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-4" style={{ borderRadius: '4px', borderLeft: '4px solid #343a40' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-tags me-2 text-dark"></i>Gestionar / Desactivar y Restaurar Géneros
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem', borderRadius: '4px', height: '32px' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th className="py-3 px-3">ID Género</th>
                                            <th className="py-3 px-3">Nombre</th>
                                            <th className="py-3 px-3">Descripción</th>
                                            <th className="py-3 px-3">Estado</th>
                                            <th className="py-3 px-3 text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generos && generos.length > 0 ? (
                                            generos.map((gen) => {
                                                const esActivo = gen.activo !== false && gen.activo !== 0 && gen.activo !== '0';
                                                return (
                                                    <tr key={gen.id} style={{ opacity: esActivo ? 1 : 0.55, backgroundColor: esActivo ? 'transparent' : '#f8f9fa' }}>
                                                        <td className="py-3 px-3 text-muted fw-semibold">{gen.id}</td>
                                                        <td className="py-3 px-3 fw-semibold text-dark">{gen.nombre}</td>
                                                        <td className="py-3 px-3 text-secondary" style={{ maxWidth: '300px' }}>{gen.descripcion || 'Sin descripción'}</td>
                                                        <td className="py-3 px-3">
                                                            <span className={`badge ${esActivo ? 'bg-success' : 'bg-secondary'}`}>{esActivo ? 'Activo' : 'Oculto'}</span>
                                                        </td>
                                                        <td className="py-3 px-3 text-end">
                                                            <button
                                                                className={`btn btn-sm ${esActivo ? 'btn-outline-danger' : 'btn-outline-success'} px-3 py-1`}
                                                                style={{ fontSize: '0.78rem', borderRadius: '4px' }}
                                                                onClick={() => handleToggleGenero(gen)}
                                                            >
                                                                <i className={`fas ${esActivo ? 'fa-ban' : 'fa-undo'} me-1`}></i>
                                                                {esActivo ? 'Desactivar' : 'Restaurar'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted">No hay géneros registrados.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* NUEVA PELÍCULA */}
                    {vistaActiva === 'nueva-peli' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #0d6efd' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-film me-2 text-primary"></i>Registrar Nueva Película
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem', borderRadius: '2px' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <form onSubmit={handleSavePelicula}>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Título de la película</label>
                                        <input type="text" className="form-control form-control-sm" value={formPeli.data.titulo} onChange={(e) => formPeli.setData('titulo', e.target.value)} required />
                                        {formPeli.errors.titulo && <span className="text-danger small">{formPeli.errors.titulo}</span>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Género</label>
                                        <select className="form-select form-select-sm" value={formPeli.data.genero_id} onChange={(e) => formPeli.setData('genero_id', e.target.value)} required>
                                            <option value="">Seleccione género...</option>
                                            {generos.filter(g => g.activo !== false && g.activo !== 0 && g.activo !== '0').map((g) => (
                                                <option key={g.id} value={g.id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                        {formPeli.errors.genero_id && <span className="text-danger small">{formPeli.errors.genero_id}</span>}
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Valoración (1-5)</label>
                                        <input type="number" step="0.1" max="5" min="0" className="form-control form-control-sm" value={formPeli.data.valoracion} onChange={(e) => formPeli.setData('valoracion', e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Estado</label>
                                        <select className="form-select form-select-sm" value={formPeli.data.estado} onChange={(e) => formPeli.setData('estado', e.target.value)}>
                                            <option value="publicada">Publicada</option>
                                            <option value="borrador">Borrador</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Sinopsis / Reseña</label>
                                        <textarea className="form-control form-control-sm" rows="2" placeholder="Escribe la reseña crítica..." value={formPeli.data.sinopsis} onChange={(e) => formPeli.setData('sinopsis', e.target.value)}></textarea>
                                    </div>
                                    <div className="col-md-9">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Imagen / Póster</label>
                                        <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => formPeli.setData('poster', e.target.files[0])} />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-end">
                                        <button type="submit" className="btn btn-primary btn-sm w-100" style={{ borderRadius: '2px' }} disabled={formPeli.processing}>
                                            {formPeli.processing ? 'Guardando...' : 'Guardar Película'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* NUEVO GÉNERO */}
                    {vistaActiva === 'nuevo-gen' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #212529' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-folder-plus me-2 text-dark"></i>Registrar Nuevo Género
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem', borderRadius: '2px' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <form onSubmit={handleSaveGenero}>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Nombre del Género</label>
                                        <input type="text" className="form-control form-control-sm" placeholder="Ej. Suspenso, Terror..." value={formGenero.data.nombre} onChange={handleNombreGeneroChange} required />
                                        {formGenero.errors.nombre && <span className="text-danger small">{formGenero.errors.nombre}</span>}
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Descripción breve</label>
                                        <input type="text" className="form-control form-control-sm" placeholder="Detalles sobre el género cinematográfico..." value={formGenero.data.descripcion} onChange={(e) => formGenero.setData('descripcion', e.target.value)} />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-end">
                                        <button type="submit" className="btn btn-dark btn-sm w-100" style={{ borderRadius: '2px' }} disabled={formGenero.processing}>
                                            {formGenero.processing ? 'Guardando...' : 'Guardar Género'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* VER DETALLE */}
                    {vistaActiva === 'ver-detalle' && peliculaSeleccionada && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-eye me-2 text-secondary"></i>Detalles: {getTitulo(peliculaSeleccionada)}
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem', borderRadius: '2px' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <div className="row">
                                <div className="col-md-2">
                                    <div
                                        style={{
                                            width: '100px', height: '140px', backgroundColor: '#e9ecef',
                                            backgroundImage: `url(${getPoster(peliculaSeleccionada)})`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                            borderRadius: '2px', border: '1px solid #ced4da'
                                        }}
                                    ></div>
                                </div>
                                <div className="col-md-10">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-1 text-dark"><strong>ID:</strong> {peliculaSeleccionada.id}</p>
                                            <p className="mb-1 text-dark"><strong>Título:</strong> {getTitulo(peliculaSeleccionada)}</p>
                                            <p className="mb-1 text-dark"><strong>Género:</strong> {getGenero(peliculaSeleccionada)}</p>
                                            <p className="mb-1 text-dark"><strong>Editor responsable:</strong> <span className="text-primary fw-semibold">{getEditor(peliculaSeleccionada)}</span></p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-1 text-dark"><strong>Fecha de registro:</strong> {getFecha(peliculaSeleccionada)}</p>
                                            <p className="mb-1 text-dark"><strong>Valoración:</strong> ★ {getValoracion(peliculaSeleccionada)}</p>
                                            <p className="mb-1 text-dark"><strong>Estado:</strong> {getEstado(peliculaSeleccionada)}</p>
                                        </div>
                                    </div>
                                    <hr className="my-2" />
                                    <div>
                                        <p className="mb-1 fw-semibold text-dark"><i className="fas fa-pen-nib me-1 text-muted"></i> Reseña:</p>
                                        <p className="mb-0 text-dark fst-italic" style={{ fontSize: '0.88rem', backgroundColor: '#fdfdfd', padding: '8px', borderLeft: '3px solid #dee2e6' }}>
                                            "{peliculaSeleccionada.sinopsis || peliculaSeleccionada.resena || 'Sin reseña detallada registrada.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EDITAR PELÍCULA */}
                    {vistaActiva === 'editar-peli' && peliculaSeleccionada && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #198754' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-edit me-2 text-success"></i>Editar Película: {getTitulo(peliculaSeleccionada)}
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem', borderRadius: '2px' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <form onSubmit={handleUpdatePelicula}>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Título</label>
                                        <input type="text" className="form-control form-control-sm" value={formEditPeli.data.titulo} onChange={(e) => formEditPeli.setData('titulo', e.target.value)} required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Género</label>
                                        <select className="form-select form-select-sm" value={formEditPeli.data.genero_id} onChange={(e) => formEditPeli.setData('genero_id', e.target.value)} required>
                                            <option value="">Seleccione género...</option>
                                            {generos.map((g) => (
                                                <option key={g.id} value={g.id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Valoración (1-5)</label>
                                        <input type="number" step="0.1" max="5" min="0" className="form-control form-control-sm" value={formEditPeli.data.valoracion} onChange={(e) => formEditPeli.setData('valoracion', e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Estado</label>
                                        <select className="form-select form-select-sm" value={formEditPeli.data.estado} onChange={(e) => formEditPeli.setData('estado', e.target.value)}>
                                            <option value="publicada">Publicada</option>
                                            <option value="borrador">Borrador</option>
                                            <option value="archivada">Archivada</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Sinopsis / Reseña</label>
                                        <textarea className="form-control form-control-sm" rows="2" value={formEditPeli.data.sinopsis} onChange={(e) => formEditPeli.setData('sinopsis', e.target.value)}></textarea>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end">
                                        <button type="submit" className="btn btn-success btn-sm px-4" style={{ borderRadius: '2px' }} disabled={formEditPeli.processing}>
                                            {formEditPeli.processing ? 'Guardando...' : 'Actualizar Película'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TABLA PRINCIPAL DE PELÍCULAS — esto es lo que faltaba */}
                    {vistaActiva === 'tabla' && (
                        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                            <div ref={tableContainerRef} className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="table-light sticky-top" style={{ zIndex: 5 }}>
                                        <tr>
                                            <th style={{ width: '60px' }} className="text-center">Póster</th>
                                            <th>Título</th>
                                            <th>Género</th>
                                            <th>Editor</th>
                                            <th>Fecha</th>
                                            <th className="text-center">Valoración</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center" style={{ width: '130px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {peliculasFiltradas.length > 0 ? (
                                            peliculasFiltradas.map((peli) => {
                                                const activa = esPeliculaActiva(peli);
                                                return (
                                                    <tr key={peli.id} style={{ opacity: activa ? 1 : 0.55, backgroundColor: activa ? 'transparent' : '#f8f9fa' }}>
                                                        <td className="text-center">
                                                            <img
                                                                src={getPoster(peli)}
                                                                alt={getTitulo(peli)}
                                                                style={{ width: '35px', height: '50px', objectFit: 'cover', borderRadius: '2px' }}
                                                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                                            />
                                                        </td>
                                                        <td className="fw-semibold text-dark">{getTitulo(peli)}</td>
                                                        <td>
                                                            <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.75rem' }}>{getGenero(peli)}</span>
                                                        </td>
                                                        <td>{getEditor(peli)}</td>
                                                        <td>{getFecha(peli)}</td>
                                                        <td className="text-center fw-bold text-warning">★ {getValoracion(peli)}</td>
                                                        <td className="text-center">
                                                            <StatusBadge status={peli.estado || (activa ? 'publicada' : 'archivada')} />
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button className="btn btn-outline-secondary" onClick={() => handleVerDetalle(peli)} title="Ver Detalle" style={{ padding: '2px 6px', borderRadius: '2px 0 0 2px' }}>
                                                                    <i className="fas fa-eye"></i>
                                                                </button>
                                                                <button className="btn btn-outline-primary" onClick={() => handleEditarPelicula(peli)} title="Editar Película" style={{ padding: '2px 6px' }}>
                                                                    <i className="fas fa-pen"></i>
                                                                </button>
                                                                <button
                                                                    className={`btn ${activa ? 'btn-outline-danger' : 'btn-success'}`}
                                                                    onClick={() => handleToggleEstado(peli)}
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
                                                <td colSpan="8" className="text-center py-4 text-muted">
                                                    <i className="fas fa-film fa-2x mb-2 d-block opacity-50"></i>
                                                    No se encontraron películas con los criterios especificados.
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