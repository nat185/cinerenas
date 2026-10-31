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

    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla', 'detalle', 'reportar'
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);

    const [mostrarFlash, setMostrarFlash] = useState(false);

    // Formulario para reportar comentarios
    const { data: dataReporte, setData: setDataReporte, post: postReporte, processing: processingReporte, reset: resetReporte, errors: errorsReporte } = useForm({
        comentario_id: '',
        tipo_reporte: 'Contenido ofensivo',
        motivo: '',
    });

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

    const handleToggleEstado = (comentario) => {
        router.delete(route('admin.comentarios.destroy', comentario.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['comentarios'] });
            }
        });
    };

    const handleVerDetalle = (comentario) => {
        setComentarioSeleccionado(comentario);
        setVistaActiva('detalle');
    };

    const handleAbrirReporte = (comentario) => {
        setComentarioSeleccionado(comentario);
        setDataReporte({
            comentario_id: comentario.id,
            tipo_reporte: 'Contenido ofensivo',
            motivo: '',
        });
        setVistaActiva('reportar');
    };

    const handleEnviarReporte = (e) => {
        e.preventDefault();
        postReporte(route('admin.moderacion.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setVistaActiva('tabla');
                resetReporte();
            }
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

    const getIdComentario = (c) => String(c.id || '');
    const getUsuarioNombre = (c) => c.usuario?.nombre || c.usuario_nombre || 'Usuario Anónimo';
    const getUsuarioCorreo = (c) => c.usuario?.correo || 'Sin correo';
    const getPeliculaTitulo = (c) => c.pelicula?.titulo || c.pelicula_titulo || 'Película general';
    const getContenido = (c) => c.texto || c.contenido || 'Sin contenido';
    const getEstado = (c) => (c.estado || 'visible').toLowerCase();

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
        const idCom = getIdComentario(c);
        const usuarioNombre = getUsuarioNombre(c);
        const usuarioCorreo = getUsuarioCorreo(c);
        const peliculaTitulo = getPeliculaTitulo(c);
        const contenido = getContenido(c);
        const estado = getEstado(c);
        const fecha = getFecha(c);

        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return estado === valorSelectFiltro.toLowerCase();
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
                return idCom.includes(val);
            case 'usuario':
                return usuarioNombre.toLowerCase().includes(val) || usuarioCorreo.toLowerCase().includes(val);
            case 'pelicula':
                return peliculaTitulo.toLowerCase().includes(val);
            case 'contenido':
                return contenido.toLowerCase().includes(val);
            default:
                return (
                    idCom.includes(val) ||
                    usuarioNombre.toLowerCase().includes(val) ||
                    usuarioCorreo.toLowerCase().includes(val) ||
                    peliculaTitulo.toLowerCase().includes(val) ||
                    contenido.toLowerCase().includes(val) ||
                    estado.toLowerCase().includes(val) ||
                    fecha.toLowerCase().includes(val)
                );
        }
    });

    return (
        <AuthenticatedLayout auth={auth} title="Gestión de Comentarios">

            {/* NOTIFICACIÓN FLOTANTE */}
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

            {/* HERO PRINCIPAL */}
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
                        Gestión de Comentarios
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Apartado para revisar, filtrar, moderar y ocultar comentarios realizados por los usuarios en las películas.
                    </p>
                </div>
            </section>

            {/* SECCIÓN PRINCIPAL */}
            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* VISTA DETALLE */}
                    {vistaActiva === 'detalle' && comentarioSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-comment-dots me-2 text-secondary"></i>Detalle del Comentario #{comentarioSeleccionado.id}
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
                                <div className="col-md-6">
                                    <p className="mb-1 text-dark"><strong>ID Comentario:</strong> #{comentarioSeleccionado.id}</p>
                                    <p className="mb-1 text-dark"><strong>Usuario:</strong> {getUsuarioNombre(comentarioSeleccionado)} ({getUsuarioCorreo(comentarioSeleccionado)})</p>
                                    <p className="mb-1 text-dark"><strong>Película asociada:</strong> {getPeliculaTitulo(comentarioSeleccionado)}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-dark"><strong>Fecha de publicación:</strong> {getFecha(comentarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Estado:</strong> <span className={`badge ${getEstado(comentarioSeleccionado) === 'visible' ? 'bg-success' : 'bg-danger'}`}>{getEstado(comentarioSeleccionado)}</span></p>
                                </div>
                                <div className="col-12 mt-2">
                                    <div className="p-3 bg-light rounded border">
                                        <strong className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Contenido del comentario:</strong>
                                        <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{getContenido(comentarioSeleccionado)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA REPORTAR */}
                    {vistaActiva === 'reportar' && comentarioSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #dc3545' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-flag me-2 text-danger"></i>Reportar Comentario #{comentarioSeleccionado.id}
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

                            <div className="p-3 bg-light rounded border mb-3">
                                <span className="text-muted small d-block mb-1">Comentario a reportar:</span>
                                <p className="mb-0 text-dark fst-italic">"{getContenido(comentarioSeleccionado)}"</p>
                                <span className="text-muted small d-block mt-2">Autor: {getUsuarioNombre(comentarioSeleccionado)}</span>
                            </div>

                            <form onSubmit={handleEnviarReporte}>
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Tipo de Reporte / Motivo:</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={dataReporte.tipo_reporte}
                                        onChange={(e) => setDataReporte('tipo_reporte', e.target.value)}
                                        required
                                    >
                                        <option value="Contenido ofensivo">Contenido ofensivo</option>
                                        <option value="Spam">Spam</option>
                                        <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                                        <option value="Spoilers">Spoilers</option>
                                        <option value="Otro motivo">Otro motivo</option>
                                    </select>
                                    {errorsReporte.tipo_reporte && <div className="text-danger small mt-1">{errorsReporte.tipo_reporte}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Notas adicionales / Explicación del reporte:</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="3"
                                        placeholder="Escribe los detalles o por qué se reporta este comentario..."
                                        value={dataReporte.motivo}
                                        onChange={(e) => setDataReporte('motivo', e.target.value)}
                                        required
                                    ></textarea>
                                    {errorsReporte.motivo && <div className="text-danger small mt-1">{errorsReporte.motivo}</div>}
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setVistaActiva('tabla')}
                                        style={{ fontSize: '0.8rem', borderRadius: '2px' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger btn-sm"
                                        disabled={processingReporte}
                                        style={{ fontSize: '0.8rem', borderRadius: '2px' }}
                                    >
                                        <i className="fas fa-paper-plane me-1"></i> Enviar Reporte a Moderación
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* FILTROS Y CONTROLES */}
                    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
                        <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ maxWidth: '170px', fontSize: '0.8rem' }}
                                value={columnaFiltro}
                                onChange={handleCambioColumna}
                            >
                                <option value="todos">Filtrar por...</option>
                                <option value="id">ID</option>
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
                                        placeholder={columnaFiltro === 'todos' ? 'Buscar comentarios...' : `Buscar por ${columnaFiltro}...`}
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

                    {/* TABLA DE COMENTARIOS */}
                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                        <div
                            ref={tableContainerRef}
                            className="table-responsive"
                            style={{ maxHeight: '600px', overflowY: 'auto' }}
                        >
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top" style={{ zIndex: 5 }}>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Usuario</th>
                                        <th>Película</th>
                                        <th>Comentario</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '150px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comentariosFiltrados.length > 0 ? (
                                        comentariosFiltrados.map((comentario) => {
                                            const esVisible = getEstado(comentario) === 'visible';

                                            return (
                                                <tr
                                                    key={comentario.id}
                                                    style={{
                                                        opacity: esVisible ? 1 : 0.55,
                                                        backgroundColor: esVisible ? 'transparent' : '#f8f9fa'
                                                    }}
                                                >
                                                    <td className="fw-bold text-muted">#{comentario.id}</td>
                                                    <td>
                                                        <div className="fw-semibold text-dark">{getUsuarioNombre(comentario)}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{getUsuarioCorreo(comentario)}</div>
                                                    </td>
                                                    <td className="fw-semibold text-secondary">{getPeliculaTitulo(comentario)}</td>
                                                    <td className="text-dark" style={{ maxWidth: '280px' }}>
                                                        <div className="text-truncate" title={getContenido(comentario)}>
                                                            {getContenido(comentario)}
                                                        </div>
                                                    </td>
                                                    <td>{getFecha(comentario)}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${esVisible ? 'bg-success' : 'bg-danger'}`}>
                                                            {getEstado(comentario)}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            {/* Ver Detalle */}
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => handleVerDetalle(comentario)}
                                                                title="Ver detalle"
                                                                style={{ padding: '2px 5px', borderRadius: '2px 0 0 2px' }}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>

                                                            {/* Reportar */}
                                                            <button
                                                                className="btn btn-outline-warning text-dark"
                                                                onClick={() => handleAbrirReporte(comentario)}
                                                                title="Reportar comentario"
                                                                style={{ padding: '2px 5px' }}
                                                            >
                                                                <i className="fas fa-flag"></i>
                                                            </button>

                                                            {/* Deshabilitar / Ocultar o Restaurar */}
                                                            <button
                                                                className={`btn ${esVisible ? 'btn-outline-danger' : 'btn-success'}`}
                                                                onClick={() => handleToggleEstado(comentario)}
                                                                title={esVisible ? 'Deshabilitar / Ocultar' : 'Restaurar'}
                                                                style={{ padding: '2px 5px', borderRadius: '0 2px 2px 0' }}
                                                            >
                                                                <i className={`fas ${esVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
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

