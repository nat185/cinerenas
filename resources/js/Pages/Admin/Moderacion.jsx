import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';

const COLORS = {
    darkBlue: '#1e293b',
    hoverBlue: '#0f172a',
    purpleCheck: '#6b21a8',
    purpleHover: '#581c87',
    border: '#cbd5e1',
};

export default function Moderacion({ auth, reportes = [], usuariosConIncidencias = [] }) {
    const { flash } = usePage().props;
    const listaReportes = Array.isArray(reportes) ? reportes : (reportes?.data ?? []);
    const listaIncidencias = Array.isArray(usuariosConIncidencias) ? usuariosConIncidencias : [];

    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');

    const [vistaActiva, setVistaActiva] = useState('tabla');
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [mostrarFlash, setMostrarFlash] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const timer = setTimeout(() => setMostrarFlash(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const tableContainerRef = useRef(null);
    const scrollTable = (direction) => {
        if (tableContainerRef.current) {
            const amount = 200;
            tableContainerRef.current.scrollBy({
                top: direction === 'down' ? amount : -amount,
                behavior: 'smooth'
            });
        }
    };

    const handleVerDetalle = (reporte) => {
        setReporteSeleccionado(reporte);
        setVistaActiva('detalle');
    };

    const handleCambiarEstado = (reporte, nuevoEstado) => {
        router.patch(route('admin.moderacion.cambiarEstado', reporte.id), { estado: nuevoEstado }, {
            preserveScroll: true,
            onSuccess: () => {
                if (vistaActiva === 'detalle') setVistaActiva('tabla');
            }
        });
    };

    const handleInhabilitarUsuario = (usuarioId, nombre) => {
        if (confirm(`¿Estás seguro de inhabilitar al usuario "${nombre}" por acumulación de reportes?`)) {
            router.post(route('admin.moderacion.inhabilitarUsuario', usuarioId), {}, {
                preserveScroll: true,
            });
        }
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
        setColumnaFiltro('todos');
    };

    const reportesFiltrados = listaReportes.filter((rep) => {
        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return (rep.estado || '').toLowerCase() === valorSelectFiltro.toLowerCase();
        }

        if (columnaFiltro === 'motivo') {
            if (!valorSelectFiltro) return true;
            return (rep.motivo || '').toLowerCase().includes(valorSelectFiltro.toLowerCase());
        }

        if (columnaFiltro === 'fecha') {
            if (!fechaFiltro) return true;
            const [anioF, mesF, diaF] = fechaFiltro.split('-');
            const fechaFormateadaInput = `${parseInt(diaF, 10)}/${parseInt(mesF, 10)}/${anioF}`;
            return rep.created_at === fechaFormateadaInput;
        }

        const val = busqueda.toLowerCase().trim();
        if (!val) return true;

        switch (columnaFiltro) {
            case 'pelicula':
                return (rep.pelicula_titulo || '').toLowerCase().includes(val);
            case 'usuario':
                return (rep.usuario_nombre || '').toLowerCase().includes(val);
            default:
                return (
                    String(rep.usuario_id).includes(val) ||
                    (rep.pelicula_titulo || '').toLowerCase().includes(val) ||
                    (rep.comentario_texto || '').toLowerCase().includes(val) ||
                    (rep.usuario_nombre || '').toLowerCase().includes(val) ||
                    (rep.motivo || '').toLowerCase().includes(val) ||
                    (rep.estado || '').toLowerCase().includes(val)
                );
        }
    });

    return (
        <AuthenticatedLayout auth={auth} title="Moderación de Contenido">
            <style>{`
                .btn-custom-blue {
                    background-color: ${COLORS.darkBlue};
                    color: #ffffff;
                    border: 1px solid ${COLORS.darkBlue};
                    font-size: 0.7rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .btn-custom-blue:hover {
                    background-color: ${COLORS.hoverBlue};
                    color: #ffffff;
                }
                .btn-purple-custom {
                    background-color: ${COLORS.purpleCheck};
                    color: #ffffff;
                    border: 1px solid ${COLORS.purpleCheck};
                    font-size: 0.7rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .btn-purple-custom:hover {
                    background-color: ${COLORS.purpleHover};
                    color: #ffffff;
                }
            `}</style>

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
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>
                        Moderación de Contenido y Reportes
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Supervisa, revisa y resuelve los reportes sobre comentarios inapropiados en las reseñas y películas.
                    </p>
                </div>
            </section>

            {/* CONTENIDO PRINCIPAL */}
            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* VISTA DETALLE DEL REPORTE */}
                    {vistaActiva === 'detalle' && reporteSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-4" style={{ borderRadius: '4px', borderLeft: `4px solid ${COLORS.darkBlue}` }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                                    <i className="fas fa-shield-alt me-2" style={{ color: COLORS.darkBlue }}></i>Detalle del Reporte #{reporteSeleccionado.id}
                                </h4>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => setVistaActiva('tabla')}
                                    style={{ fontSize: '0.7rem', borderRadius: '4px', padding: '2px 8px' }}
                                >
                                    <i className="fas fa-arrow-left me-1"></i> Regresar
                                </button>
                            </div>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <p className="mb-1 text-dark"><strong>Película asociada:</strong> {reporteSeleccionado.pelicula_titulo}</p>
                                    <p className="mb-1 text-dark"><strong>Usuario (ID #{reporteSeleccionado.usuario_id}):</strong> {reporteSeleccionado.usuario_nombre}</p>
                                    <p className="mb-1 text-dark"><strong>Fecha de reporte:</strong> {reporteSeleccionado.created_at}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-dark"><strong>Estado actual:</strong> 
                                        <span className="badge ms-2 bg-secondary" style={{ fontSize: '0.7rem' }}>
                                            {reporteSeleccionado.estado}
                                        </span>
                                    </p>
                                    <div className="mt-2">
                                        <label className="form-label text-muted small fw-bold">Cambiar Estado:</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            <button className="btn-custom-blue" onClick={() => handleCambiarEstado(reporteSeleccionado, 'pendiente')}>Marcar Pendiente</button>
                                            <button className="btn-purple-custom" onClick={() => handleCambiarEstado(reporteSeleccionado, 'ocultar')}>
                                                <i className="fas fa-check me-1"></i> Resolver (Ocultar)
                                            </button>
                                            <button className="btn btn-dark btn-sm text-white" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '4px' }} onClick={() => handleCambiarEstado(reporteSeleccionado, 'archivar')}>Archivar (Incidencia)</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 bg-light p-3 rounded border mt-2">
                                    <p className="mb-1 text-muted small fw-bold">Texto del Comentario:</p>
                                    <p className="mb-2 text-dark fst-italic">"{reporteSeleccionado.comentario_texto}"</p>
                                    <p className="mb-1 text-muted small fw-bold">Motivo del Reporte:</p>
                                    <p className="mb-0 text-danger">{reporteSeleccionado.motivo}</p>
                                </div>
                            </div>
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
                                <option value="pelicula">Película</option>
                                <option value="usuario">Usuario</option>
                                <option value="motivo">Motivo</option>
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
                                    <option value="pendiente">Pendiente</option>
                                    <option value="archivar">Archivar</option>
                                </select>
                            ) : columnaFiltro === 'motivo' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '240px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Todos los motivos</option>
                                    <option value="Contenido ofensivo">Contenido ofensivo</option>
                                    <option value="Spam">Spam</option>
                                    <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                                    <option value="Spoilers">Spoilers</option>
                                    <option value="Otro motivo">Otro motivo</option>
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
                                        placeholder={columnaFiltro === 'todos' ? 'Buscar reportes...' : `Buscar por ${columnaFiltro}...`}
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
                            <button className="btn btn-sm btn-light border" onClick={() => scrollTable('up')} title="Desplazar arriba">
                                <i className="fas fa-chevron-up"></i>
                            </button>
                            <button className="btn btn-sm btn-light border" onClick={() => scrollTable('down')} title="Desplazar abajo">
                                <i className="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    {/* TABLA PRINCIPAL DE REPORTES */}
                    <div className="card border-0 shadow-sm bg-white mb-5" style={{ borderRadius: '4px' }}>
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 text-dark fw-bold" style={{ fontSize: '0.95rem' }}>
                                <i className="fas fa-flag me-2 text-danger"></i>Reportes de Moderación Activos
                            </h5>
                        </div>
                        <div ref={tableContainerRef} className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top" style={{ zIndex: 5 }}>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID U.</th>
                                        <th>Película</th>
                                        <th>Comentario</th>
                                        <th>Usuario</th>
                                        <th>Motivo del Reporte</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '110px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportesFiltrados.length > 0 ? (
                                        reportesFiltrados.map((rep) => (
                                            <tr key={rep.id}>
                                                <td className="fw-bold text-muted">#{rep.usuario_id}</td>
                                                <td className="fw-semibold text-dark">{rep.pelicula_titulo}</td>
                                                <td className="text-muted fst-italic" style={{ maxWidth: '180px' }}>
                                                    <div className="text-truncate">"{rep.comentario_texto}"</div>
                                                </td>
                                                <td className="text-dark fw-medium">{rep.usuario_nombre}</td>
                                                <td>
                                                    <span className="text-danger fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                        {rep.motivo}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{rep.created_at}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${rep.estado === 'archivar' ? 'bg-dark' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                                                        {rep.estado}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        {/* Botón Ver Detalle (Ojo) */}
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm px-2 py-1"
                                                            onClick={() => handleVerDetalle(rep)}
                                                            title="Observar detalle"
                                                            style={{ fontSize: '0.75rem' }}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        {/* Botón Resolver / Ocultar (Paloma Morada) */}
                                                        <button
                                                            className="btn btn-sm text-white px-2 py-1"
                                                            onClick={() => handleCambiarEstado(rep, 'ocultar')}
                                                            title="Resolver y ocultar"
                                                            style={{ fontSize: '0.75rem', backgroundColor: COLORS.purpleCheck }}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-muted">
                                                <i className="fas fa-shield-alt fa-2x mb-2 d-block opacity-50"></i>
                                                No hay reportes de moderación activos en este momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR: USUARIOS CON 5 O MÁS INCIDENCIAS */}
                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '4px', borderTop: '4px solid #dc3545' }}>
                        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-danger fw-bold" style={{ fontSize: '0.95rem' }}>
                                <i className="fas fa-user-slash me-2"></i>Usuarios con 5 o más Incidencias Reportadas
                            </h5>
                            <span className="badge bg-danger">{listaIncidencias.length} usuarios</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '80px' }}>ID Usuario</th>
                                        <th>Nombre del Usuario</th>
                                        <th>Comentarios Reportados</th>
                                        <th>Motivos Acumulados</th>
                                        <th className="text-center">Incidencias</th>
                                        <th className="text-center" style={{ width: '130px' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaIncidencias.length > 0 ? (
                                        listaIncidencias.map((item) => (
                                            <tr key={item.usuario_id}>
                                                <td className="fw-bold text-muted">#{item.usuario_id}</td>
                                                <td className="fw-bold text-dark">{item.nombre}</td>
                                                <td className="text-muted" style={{ maxWidth: '220px' }}>
                                                    <div className="text-truncate">"{item.comentarios}"</div>
                                                </td>
                                                <td className="text-danger small">{item.motivos}</td>
                                                <td className="text-center">
                                                    <span className="badge bg-danger rounded-pill px-2 py-1">{item.incidencias} reportes</span>
                                                </td>
                                                <td className="text-center">
                                                    {item.estado === 'inactivo' ? (
                                                        <span className="badge bg-secondary">Inhabilitado</span>
                                                    ) : (
                                                        <button
                                                            className="btn btn-danger btn-sm text-white"
                                                            onClick={() => handleInhabilitarUsuario(item.usuario_id, item.nombre)}
                                                            style={{ fontSize: '0.7rem', borderRadius: '4px', padding: '2px 6px' }}
                                                        >
                                                            <i className="fas fa-ban me-1"></i> Inhabilitar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-3 text-muted">
                                                No hay usuarios que alcancen el límite de 5 incidencias acumuladas.
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



