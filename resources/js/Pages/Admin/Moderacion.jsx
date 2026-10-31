import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';

export default function Moderacion({ auth, reportes = [], usuariosConIncidencias = [] }) {
    const { flash } = usePage().props;
    const listaReportes = Array.isArray(reportes) ? reportes : (reportes?.data ?? []);
    const listaUsuariosIncidencias = Array.isArray(usuariosConIncidencias) ? usuariosConIncidencias : [];

    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');

    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' o 'detalle'
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

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

    const handleCambiarEstadoReporte = (reporteId, nuevoEstado) => {
        router.patch(route('admin.moderacion.cambiarEstado', reporteId), {
            estado: nuevoEstado
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                if (reporteSeleccionado && reporteSeleccionado.id === reporteId) {
                    setReporteSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
                }
                router.reload({ only: ['reportes', 'usuariosConIncidencias'] });
            }
        });
    };

    const handleInhabilitarUsuario = (usuarioId) => {
        if (confirm('¿Estás seguro de inhabilitar este usuario por acumulación de incidencias?')) {
            router.post(route('admin.moderacion.inhabilitarUsuario', usuarioId), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                }
            });
        }
    };

    const handleVerDetalle = (reporte) => {
        setReporteSeleccionado(reporte);
        setVistaActiva('detalle');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCerrarDetalle = () => {
        setVistaActiva('tabla');
        setReporteSeleccionado(null);
    };

    const handleCambioColumna = (e) => {
        setColumnaFiltro(e.target.value);
        setBusqueda('');
        setValorSelectFiltro('');
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setValorSelectFiltro('');
    };

    const getEstadoBadgeClass = (estado) => {
        switch ((estado || '').toLowerCase()) {
            case 'pendiente': return 'bg-secondary text-white';
            case 'revisado': return 'bg-info text-dark';
            case 'aprobado': return 'bg-success text-white';
            case 'eliminado': return 'bg-dark text-white';
            default: return 'bg-dark text-white';
        }
    };

    const reportesFiltrados = listaReportes.filter((rep) => {
        const idRep = String(rep.id || '');
        const usuarioNombre = String(rep.usuario_nombre || '');
        const peliculaTitulo = String(rep.pelicula_titulo || '');
        const motivo = String(rep.motivo || '');
        const estado = String(rep.estado || '').toLowerCase();

        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return estado === valorSelectFiltro.toLowerCase();
        }

        if (columnaFiltro === 'motivo') {
            if (!valorSelectFiltro) return true;
            return motivo.toLowerCase().includes(valorSelectFiltro.toLowerCase());
        }

        const val = busqueda.toLowerCase().trim();
        if (!val) return true;

        switch (columnaFiltro) {
            case 'id':
                return idRep.includes(val);
            case 'usuario':
                return usuarioNombre.toLowerCase().includes(val);
            case 'pelicula':
                return peliculaTitulo.toLowerCase().includes(val);
            default:
                return (
                    idRep.includes(val) ||
                    usuarioNombre.toLowerCase().includes(val) ||
                    peliculaTitulo.toLowerCase().includes(val) ||
                    motivo.toLowerCase().includes(val) ||
                    estado.includes(val)
                );
        }
    });

    return (
        <AuthenticatedLayout auth={auth} title="Panel de Moderación">

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
                        Panel de Moderación
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Supervisa reportes de comentarios, modera contenidos y controla usuarios con múltiples incidencias.
                    </p>
                </div>
            </section>

            {/* SECCIÓN PRINCIPAL */}
            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* VISTA DETALLE DEL REPORTE (ARRIBA) */}
                    {vistaActiva === 'detalle' && reporteSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-4" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                                    <i className="fas fa-shield-alt me-2 text-secondary"></i>Detalle del Reporte #{reporteSeleccionado.id}
                                </h4>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm px-3 py-1"
                                    onClick={handleCerrarDetalle}
                                    style={{ fontSize: '0.75rem', borderRadius: '2px' }}
                                >
                                    <i className="fas fa-arrow-left me-1"></i> REGRESAR
                                </button>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <p className="mb-1 text-dark" style={{ fontSize: '0.85rem' }}><strong>Película asociada:</strong> {reporteSeleccionado.pelicula_titulo}</p>
                                    <p className="mb-1 text-dark" style={{ fontSize: '0.85rem' }}><strong>Usuario (ID #{reporteSeleccionado.usuario_id}):</strong> {reporteSeleccionado.usuario_nombre}</p>
                                    <p className="mb-1 text-dark" style={{ fontSize: '0.85rem' }}><strong>Fecha de reporte:</strong> {reporteSeleccionado.created_at}</p>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <strong className="text-dark" style={{ fontSize: '0.85rem' }}>Estado actual:</strong>
                                        <span className={`badge ${getEstadoBadgeClass(reporteSeleccionado.estado)}`} style={{ fontSize: '0.75rem' }}>
                                            {reporteSeleccionado.estado}
                                        </span>
                                    </div>
                                    <div>
                                        <strong className="text-dark d-block mb-2" style={{ fontSize: '0.8rem' }}>Cambiar Estado:</strong>
                                        {/* Botones uniformes, compactos y con la paleta de colores azul/acua, verde, slate y gris */}
                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3 py-1 text-white"
                                                onClick={() => handleCambiarEstadoReporte(reporteSeleccionado.id, 'pendiente')}
                                                style={{ fontSize: '0.75rem', borderRadius: '2px', backgroundColor: '#6c757d', minWidth: '95px' }}
                                            >
                                                Pendiente
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3 py-1 text-white"
                                                onClick={() => handleCambiarEstadoReporte(reporteSeleccionado.id, 'revisado')}
                                                style={{ fontSize: '0.75rem', borderRadius: '2px', backgroundColor: '#17a2b8', minWidth: '95px' }}
                                            >
                                                Revisado
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3 py-1 text-white"
                                                onClick={() => handleCambiarEstadoReporte(reporteSeleccionado.id, 'aprobado')}
                                                style={{ fontSize: '0.75rem', borderRadius: '2px', backgroundColor: '#20c997', minWidth: '95px' }}
                                            >
                                                Aprobado
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3 py-1 text-white"
                                                onClick={() => handleCambiarEstadoReporte(reporteSeleccionado.id, 'eliminado')}
                                                style={{ fontSize: '0.75rem', borderRadius: '2px', backgroundColor: '#495057', minWidth: '95px' }}
                                            >
                                                Archivar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-light rounded border">
                                <strong className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Texto del Comentario:</strong>
                                <p className="mb-3 text-dark fst-italic" style={{ fontSize: '0.85rem' }}>"{reporteSeleccionado.comentario_texto}"</p>
                                <strong className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Motivo del Reporte:</strong>
                                <p className="mb-0 text-danger fw-semibold" style={{ fontSize: '0.85rem' }}>{reporteSeleccionado.motivo}</p>
                            </div>
                        </div>
                    )}

                    {/* CABECERA Y FILTROS */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="text-dark mb-0" style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                            <i className="fas fa-flag me-2 text-secondary"></i>Reportes de Moderación Activos
                        </h5>
                    </div>

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
                                <option value="motivo">Motivo</option>
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
                                    <option value="revisado">Revisado</option>
                                    <option value="aprobado">Aprobado</option>
                                    <option value="eliminado">Archivado / Eliminado</option>
                                </select>
                            ) : columnaFiltro === 'motivo' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '220px', fontSize: '0.8rem' }}
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

                            {(busqueda || valorSelectFiltro) && (
                                <button
                                    className="btn btn-sm btn-outline-secondary px-2 py-1"
                                    onClick={limpiarFiltros}
                                    style={{ fontSize: '0.75rem', borderRadius: '4px' }}
                                >
                                    <i className="fas fa-times me-1"></i>Limpiar
                                </button>
                            )}
                        </div>

                        <div className="btn-group btn-group-sm" role="group">
                            <button className="btn btn-light border px-2 py-1" onClick={() => scrollTable('up')} title="Desplazar arriba">
                                <i className="fas fa-chevron-up"></i>
                            </button>
                            <button className="btn btn-light border px-2 py-1" onClick={() => scrollTable('down')} title="Desplazar abajo">
                                <i className="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    {/* TABLA DE REPORTES */}
                    <div className="card border-0 shadow-sm bg-white mb-5" style={{ borderRadius: '2px' }}>
                        <div ref={tableContainerRef} className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top" style={{ zIndex: 5 }}>
                                    <tr>
                                        <th style={{ width: '70px' }}>ID</th>
                                        <th>Usuario</th>
                                        <th>Película</th>
                                        <th>Comentario / Motivo</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '120px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportesFiltrados.length > 0 ? (
                                        reportesFiltrados.map((rep) => {
                                            const esEliminado = (rep.estado || '').toLowerCase() === 'eliminado';
                                            return (
                                                <tr
                                                    key={rep.id}
                                                    style={{
                                                        opacity: esEliminado ? 0.55 : 1,
                                                        backgroundColor: esEliminado ? '#f8f9fa' : 'transparent'
                                                    }}
                                                >
                                                    <td className="fw-bold text-muted">#{rep.id}</td>
                                                    <td>
                                                        <div className="fw-semibold text-dark">{rep.usuario_nombre}</div>
                                                    </td>
                                                    <td className="fw-semibold text-secondary">{rep.pelicula_titulo}</td>
                                                    <td className="text-dark" style={{ maxWidth: '280px' }}>
                                                        <div className="text-truncate fw-semibold text-danger" title={rep.motivo}>
                                                            {rep.motivo}
                                                        </div>
                                                        <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                                                            "{rep.comentario_texto}"
                                                        </div>
                                                    </td>
                                                    <td>{rep.created_at}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${getEstadoBadgeClass(rep.estado)}`} style={{ fontSize: '0.75rem' }}>
                                                            {rep.estado}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm px-2 py-1"
                                                            onClick={() => handleVerDetalle(rep)}
                                                            title="Ver detalle y gestionar"
                                                            style={{ fontSize: '0.75rem', borderRadius: '2px' }}
                                                        >
                                                            <i className="fas fa-eye me-1"></i> Gestionar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                <i className="fas fa-shield-alt fa-2x mb-2 d-block opacity-50"></i>
                                                No hay reportes de moderación pendientes o activos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR: TABLA DE USUARIOS CON 5+ INCIDENCIAS */}
                    <div className="mt-4 pt-3 border-top">
                        <h5 className="text-dark mb-3" style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                            <i className="fas fa-users-slash me-2 text-danger"></i>Usuarios con Incidencias (5 o más)
                        </h5>
                        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Usuario ID</th>
                                            <th>Nombre</th>
                                            <th>Estado Cuenta</th>
                                            <th className="text-center">Total Incidencias</th>
                                            <th>Motivos / Comentarios</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listaUsuariosIncidencias.length > 0 ? (
                                            listaUsuariosIncidencias.map((usr) => (
                                                <tr key={usr.usuario_id}>
                                                    <td className="fw-bold text-muted">#{usr.usuario_id}</td>
                                                    <td className="fw-semibold text-dark">{usr.nombre}</td>
                                                    <td>
                                                        <span className={`badge ${usr.estado === 'activo' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                            {usr.estado}
                                                        </span>
                                                    </td>
                                                    <td className="text-center fw-bold text-danger">{usr.incidencias}</td>
                                                    <td className="text-muted" style={{ maxWidth: '300px' }}>
                                                        <div className="text-truncate" title={usr.motivos}>
                                                            {usr.motivos}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {usr.estado === 'activo' ? (
                                                            <button
                                                                className="btn btn-danger btn-sm px-2 py-1"
                                                                onClick={() => handleInhabilitarUsuario(usr.usuario_id)}
                                                                style={{ fontSize: '0.7rem', borderRadius: '2px' }}
                                                            >
                                                                <i className="fas fa-user-lock me-1"></i> Inhabilitar Cuenta
                                                            </button>
                                                        ) : (
                                                            <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>Inhabilitado</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    <i className="fas fa-user-check fa-2x mb-2 d-block opacity-50"></i>
                                                    No hay usuarios con 5 o más incidencias acumuladas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}

