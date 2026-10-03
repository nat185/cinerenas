import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';

export default function Comentarios({ auth, comentarios = [] }) {
    const { flash } = usePage().props;
    const listaComentarios = Array.isArray(comentarios) ? comentarios : (comentarios?.data ?? []);

    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');

    const [vistaActiva, setVistaActiva] = useState('tabla');
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);

    const formReporte = useForm({
        comentario_id: '',
        tipo_reporte: 'Contenido ofensivo',
        motivo: '',
    });

    const [mostrarFlash, setMostrarFlash] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const timer = setTimeout(() => {
                setMostrarFlash(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

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

    const esComentarioVisible = (c) => {
        const estado = (c.estado || 'visible').toLowerCase();
        return estado !== 'oculto';
    };

    const handleToggleEstado = (comentario) => {
        const visible = esComentarioVisible(comentario);
        const accion = visible ? 'ocultar este comentario' : 'restaurar este comentario';

        if (confirm(`¿Deseas ${accion}?`)) {
            router.delete(route('admin.comentarios.destroy', comentario.id), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleVerDetalle = (comentario) => {
        setComentarioSeleccionado(comentario);
        setVistaActiva('detalle');
    };

    const handleAbrirReporte = (comentario) => {
        setComentarioSeleccionado(comentario);
        formReporte.setData({
            comentario_id: comentario.id,
            tipo_reporte: 'Contenido ofensivo',
            motivo: '',
        });
        setVistaActiva('reportar');
    };

    const handleEnviarReporte = (e) => {
        e.preventDefault();
        formReporte.post(route('admin.moderacion.store'), {
            onSuccess: () => {
                formReporte.reset();
                setVistaActiva('tabla');
            },
        });
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

    // ID del usuario que realizó el comentario
    const getIdUsuario = (c) => String(c.usuario_id || c.user_id || c.usuario?.id || '');
    const getUsuario = (c) => c.usuario?.name || c.user_name || 'Usuario Anónimo';
    const getPelicula = (c) => c.pelicula?.titulo || c.pelicula_titulo || 'General';
    const getContenido = (c) => c.texto || c.contenido || c.comentario || 'Sin contenido';
    const getEstado = (c) => c.estado || 'visible';
    
    const getFecha = (c) => {
        if (!c.created_at) return 'N/A';
        const partes = c.created_at.split('T')[0].split(' ')[0].split('-');
        if (partes.length === 3) {
            const anio = partes[0];
            const mes = parseInt(partes[1], 10);
            const dia = parseInt(partes[2], 10);
            return `${dia}/${mes}/${anio}`;
        }
        return 'N/A';
    };

    const comentariosFiltrados = listaComentarios.filter((c) => {
        const idUsr = getIdUsuario(c);
        const usuario = getUsuario(c);
        const pelicula = getPelicula(c);
        const contenido = getContenido(c);
        const estado = getEstado(c);
        const fecha = getFecha(c);

        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return estado.toLowerCase() === valorSelectFiltro.toLowerCase();
        }

        if (columnaFiltro === 'fecha') {
            if (!fechaFiltro) return true;
            const [anioF, mesF, diaF] = fechaFiltro.split('-');
            const fechaFormateadaInput = `${parseInt(diaF, 10)}/${parseInt(mesF, 10)}/${anioF}`;
            return fecha === fechaFormateadaInput;
        }

        const val = busqueda.toLowerCase().trim();
        if (!val) return true;

        switch (columnaFiltro) {
            case 'id':
                return idUsr.includes(val);
            case 'usuario':
                return usuario.toLowerCase().includes(val);
            case 'pelicula':
                return pelicula.toLowerCase().includes(val);
            case 'contenido':
                return contenido.toLowerCase().includes(val);
            default:
                return (
                    idUsr.includes(val) ||
                    usuario.toLowerCase().includes(val) ||
                    pelicula.toLowerCase().includes(val) ||
                    contenido.toLowerCase().includes(val) ||
                    estado.toLowerCase().includes(val) ||
                    fecha.toLowerCase().includes(val)
                );
        }
    });

    return (
        <AuthenticatedLayout auth={auth} title="Moderación de Comentarios">

            {mostrarFlash && (flash?.message || flash?.error) && (
                <div 
                    className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        zIndex: 9999,
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        maxWidth: '320px'
                    }}
                >
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button 
                        type="button" 
                        className="btn-close ms-2" 
                        style={{ fontSize: '0.6rem' }} 
                        onClick={() => setMostrarFlash(false)}
                    ></button>
                </div>
            )}

            <section
                style={{
                    position: 'relative',
                    minHeight: '180px',
                    paddingTop: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)',
                        zIndex: 1
                    }}
                ></div>

                <div
                    className="container-fluid px-4 px-lg-5"
                    style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}
                >
                    <h1
                        className="font-heading text-white mb-1"
                        style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}
                    >
                        Moderación de Comentarios
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Apartado para revisar, moderar, ocultar, reportar o restaurar las opiniones emitidas por los usuarios.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {vistaActiva === 'detalle' && comentarioSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-eye me-2 text-secondary"></i>Detalle del Comentario #{comentarioSeleccionado.id}
                                </h4>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => setVistaActiva('tabla')}
                                    style={{ fontSize: '0.8rem', borderRadius: '2px' }}
                                >
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <p className="mb-1 text-dark"><strong>ID Usuario:</strong> #{getIdUsuario(comentarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Usuario:</strong> {getUsuario(comentarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Película:</strong> {getPelicula(comentarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Calificación:</strong> ★ {comentarioSeleccionado.calificacion ?? 'N/A'}</p>
                                    <p className="mb-1 text-dark"><strong>Fecha:</strong> {getFecha(comentarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Estado:</strong> <span className="badge bg-success">{getEstado(comentarioSeleccionado)}</span></p>
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>Contenido íntegro:</label>
                                    <div className="p-3 bg-light border rounded text-dark" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                        "{getContenido(comentarioSeleccionado)}"
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {vistaActiva === 'reportar' && comentarioSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #dc3545' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-danger" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-flag me-2"></i>Reportar Comentario #{comentarioSeleccionado.id}
                                </h4>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => setVistaActiva('tabla')}
                                    style={{ fontSize: '0.8rem', borderRadius: '2px' }}
                                >
                                    <i className="fas fa-arrow-left me-1"></i> Regresar a la tabla
                                </button>
                            </div>
                            <form onSubmit={handleEnviarReporte}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Tipo de Reporte / Motivo Principal</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={formReporte.data.tipo_reporte}
                                            onChange={(e) => formReporte.setData('tipo_reporte', e.target.value)}
                                            required
                                        >
                                            <option value="Contenido ofensivo">Contenido ofensivo o groserías</option>
                                            <option value="Spam">Spam o publicidad no deseada</option>
                                            <option value="Información falsa">Información falsa o spoilers malintencionados</option>
                                            <option value="Lenguaje inapropiado">Lenguaje inapropiado / Hincapié al odio</option>
                                            <option value="Otro">Otro motivo</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Descripción detallada del reporte</label>
                                        <textarea
                                            className="form-control form-control-sm"
                                            rows="3"
                                            placeholder="Explica brevemente por qué se reporta este comentario..."
                                            value={formReporte.data.motivo}
                                            onChange={(e) => formReporte.setData('motivo', e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end">
                                        <button
                                            type="submit"
                                            className="btn btn-danger btn-sm px-4"
                                            style={{ borderRadius: '2px' }}
                                            disabled={formReporte.processing}
                                        >
                                            {formReporte.processing ? 'Enviando reporte...' : 'Enviar Reporte de Moderación'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
                        <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ maxWidth: '170px', fontSize: '0.8rem' }}
                                value={columnaFiltro}
                                onChange={handleCambioColumna}
                            >
                                <option value="todos">Filtrar por...</option>
                                <option value="id">ID Usuario</option>
                                <option value="usuario">Usuario</option>
                                <option value="pelicula">Película</option>
                                <option value="contenido">Contenido</option>
                                <option value="fecha">Fecha</option>
                                <option value="estado">Estado</option>
                            </select>

                            {columnaFiltro === 'estado' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="visible">Visible</option>
                                    <option value="oculto">Oculto</option>
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
                                        placeholder={columnaFiltro === 'todos' ? 'Buscar comentarios...' : `Buscar por ID de usuario...`}
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                </div>
                            )}

                            {(busqueda || valorSelectFiltro || fechaFiltro) && (
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={limpiarFiltros}
                                    style={{ fontSize: '0.75rem', borderRadius: '4px' }}
                                >
                                    <i className="fas fa-times me-1"></i>Limpiar
                                </button>
                            )}
                        </div>

                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                className="btn btn-sm btn-light border"
                                onClick={() => scrollTable('up')}
                                title="Desplazar arriba"
                            >
                                <i className="fas fa-chevron-up"></i>
                            </button>
                            <button
                                className="btn btn-sm btn-light border"
                                onClick={() => scrollTable('down')}
                                title="Desplazar abajo"
                            >
                                <i className="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                        <div
                            ref={tableContainerRef}
                            className="table-responsive"
                            style={{ maxHeight: '600px', overflowY: 'auto' }}
                        >
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top" style={{ zIndex: 5 }}>
                                    <tr>
                                        <th style={{ width: '90px' }}>ID Usuario</th>
                                        <th>Usuario</th>
                                        <th>Película</th>
                                        <th>Comentario / Contenido</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '150px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comentariosFiltrados.length > 0 ? (
                                        comentariosFiltrados.map((comentario) => {
                                            const visible = esComentarioVisible(comentario);

                                            return (
                                                <tr key={comentario.id} style={{ opacity: visible ? 1 : 0.55, backgroundColor: visible ? 'transparent' : '#f8f9fa' }}>
                                                    <td className="fw-bold text-muted">#{getIdUsuario(comentario)}</td>
                                                    <td className="fw-semibold text-dark">{getUsuario(comentario)}</td>
                                                    <td>
                                                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.75rem' }}>
                                                            {getPelicula(comentario)}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted text-wrap" style={{ maxWidth: '300px' }}>
                                                        "{getContenido(comentario)}"
                                                    </td>
                                                    <td>{getFecha(comentario)}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${visible ? 'bg-success' : 'bg-secondary'}`}>
                                                            {getEstado(comentario)}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => handleVerDetalle(comentario)}
                                                                title="Ver contenido completo"
                                                                style={{ padding: '2px 6px', borderRadius: '2px 0 0 2px' }}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>

                                                            <button
                                                                className="btn btn-outline-warning text-dark"
                                                                onClick={() => handleAbrirReporte(comentario)}
                                                                title="Reportar comentario"
                                                                style={{ padding: '2px 6px' }}
                                                            >
                                                                <i className="fas fa-flag"></i>
                                                            </button>

                                                            <button
                                                                className={`btn ${visible ? 'btn-outline-danger' : 'btn-success'}`}
                                                                onClick={() => handleToggleEstado(comentario)}
                                                                title={visible ? 'Ocultar comentario' : 'Restaurar comentario'}
                                                                style={{ padding: '2px 6px', borderRadius: '0 2px 2px 0' }}
                                                            >
                                                                <i className={`fas ${visible ? 'fa-trash-alt' : 'fa-undo'}`}></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                <i className="fas fa-comments fa-2x mb-2 d-block opacity-50"></i>
                                                No se encontraron comentarios registrados con los criterios especificados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}

