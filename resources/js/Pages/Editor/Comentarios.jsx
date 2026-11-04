import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';

export default function EditorComentarios({ auth, comentarios = [] }) {
    const { flash } = usePage().props;
    const listaComentarios = Array.isArray(comentarios) ? comentarios : (comentarios?.data ?? []);

    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' | 'ver' | 'reportar'
    const [seleccionado, setSeleccionado] = useState(null);
    const [mostrarFlash, setMostrarFlash] = useState(false);

    // Estados para los filtros
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [motivoFiltro, setMotivoFiltro] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const t = setTimeout(() => setMostrarFlash(false), 3000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const form = useForm({ motivo: 'Contenido ofensivo' });

    const getUsuario = (c) => c.usuario?.nombre || c.usuario?.name || 'Usuario Anónimo';
    const getPelicula = (c) => c.pelicula?.titulo || 'General';
    const getContenido = (c) => c.texto || c.contenido || 'Sin contenido';
    
    const getFechaVisual = (raw) => {
        if (!raw) return 'N/A';
        const str = String(raw).trim().split('T')[0].split(' ')[0];
        if (str.includes('-')) {
            const [yyyy, mm, dd] = str.split('-');
            return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
        }
        if (str.includes('/')) return str;
        return 'N/A';
    };

    // Máscara dinámica DD/MM/AAAA para el filtro de fecha
    const handleFechaInput = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.substring(0, 8);

        if (val.length > 4) {
            val = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4)}`;
        } else if (val.length > 2) {
            val = `${val.substring(0, 2)}/${val.substring(2)}`;
        }
        setFechaFiltro(val);
    };

    // Badge con la paleta exacta usada en el panel de administración
    const renderBadgeEstado = (estado) => {
        const est = String(estado || 'sin_reporte').toLowerCase().trim();
        
        if (est === 'sin_reporte') {
            return <span className="badge bg-secondary text-white px-2 py-1" style={{ fontSize: '0.75rem', borderRadius: '4px' }}>SIN REPORTAR</span>;
        }

        let bgStyle = '#6c757d'; // PENDIENTE (Gris)
        if (est === 'revisado') { bgStyle = '#17a2b8'; }      // REVISADO (Turquesa)
        else if (est === 'aprobado') { bgStyle = '#20c997'; }  // APROBADO (Verde esmeralda)
        else if (est === 'archivado') { bgStyle = '#495057'; } // ARCHIVADO (Gris oscuro)

        return (
            <span className="badge text-white px-2 py-1" style={{ backgroundColor: bgStyle, fontSize: '0.75rem', borderRadius: '4px', letterSpacing: '0.03em' }}>
                {est.toUpperCase()}
            </span>
        );
    };

    const handleCambioColumna = (e) => {
        setColumnaFiltro(e.target.value);
        setBusqueda('');
        setMotivoFiltro('');
        setEstadoFiltro('');
        setFechaFiltro('');
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setMotivoFiltro('');
        setEstadoFiltro('');
        setFechaFiltro('');
        setColumnaFiltro('todos');
    };

    // Filtrado avanzado
    const comentariosFiltrados = listaComentarios.filter((c) => {
        const idStr = String(c.id || '');
        const usuario = getUsuario(c).toLowerCase();
        const pelicula = getPelicula(c).toLowerCase();
        const contenido = getContenido(c).toLowerCase();
        const fechaVisual = getFechaVisual(c.created_at);
        const estado = (c.estado || 'sin_reporte').toLowerCase();
        const motivo = (c.motivo_reporte || '').toLowerCase();

        if (columnaFiltro === 'motivo') {
            if (!motivoFiltro) return true;
            return motivo.includes(motivoFiltro.toLowerCase());
        }
        if (columnaFiltro === 'estado') {
            if (!estadoFiltro) return true;
            return estado === estadoFiltro.toLowerCase();
        }
        if (columnaFiltro === 'fecha') {
            if (!fechaFiltro) return true;
            return fechaVisual.includes(fechaFiltro.trim());
        }

        const val = busqueda.toLowerCase().trim();
        if (!val) return true;

        switch (columnaFiltro) {
            case 'id':
                return idStr.includes(val);
            case 'usuario':
                return usuario.includes(val);
            case 'pelicula':
                return pelicula.includes(val);
            case 'comentario':
                return contenido.includes(val);
            default:
                return idStr.includes(val) || usuario.includes(val) || pelicula.includes(val) || contenido.includes(val) || fechaVisual.includes(val) || estado.includes(val);
        }
    });

    const handleVer = (c) => { setSeleccionado(c); setVistaActiva('ver'); };
    
    const handleReportar = (c) => { 
        setSeleccionado(c); 
        form.setData('motivo', 'Contenido ofensivo'); 
        setVistaActiva('reportar'); 
    };

    const handleEnviarReporte = (e) => {
        e.preventDefault();
        // En Inertia, transform() no devuelve el formulario: se llama aparte y luego se envía.
        form.transform((data) => ({
            tipo_reporte: data.motivo,
            motivo: `"${getContenido(seleccionado)}"`,
        }));

        form.post(route('editor.comentarios.reportar', seleccionado.id), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setVistaActiva('tabla'); },
            onFinish: () => form.transform((data) => data),
        });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Comentarios">
            {mostrarFlash && (flash?.message || flash?.error) && (
                <div className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.8rem', borderRadius: '4px', maxWidth: '320px' }}>
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setMostrarFlash(false)}></button>
                </div>
            )}

            <section style={{
                position: 'relative', minHeight: '180px', paddingTop: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>Comentarios</h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Lee lo que opinan los usuarios sobre tus películas. Puedes reportar cualquier comentario inapropiado a moderación.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 180px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {vistaActiva === 'ver' && seleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-eye me-2 text-secondary"></i>Comentario #{seleccionado.id}</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <p className="mb-1 text-dark"><strong>ID:</strong> #{seleccionado.id}</p>
                            <p className="mb-1 text-dark"><strong>Usuario:</strong> {getUsuario(seleccionado)}</p>
                            <p className="mb-1 text-dark"><strong>Película:</strong> {getPelicula(seleccionado)}</p>
                            <p className="mb-1 text-dark"><strong>Fecha:</strong> {getFechaVisual(seleccionado.created_at)}</p>
                            <p className="mb-1 text-dark"><strong>Estado del Reporte:</strong> {renderBadgeEstado(seleccionado.estado)}</p>
                            {seleccionado.motivo_reporte && (
                                <p className="mb-1 text-dark"><strong>Motivo enviado:</strong> {seleccionado.motivo_reporte}</p>
                            )}
                            <hr className="my-2" />
                            <div className="p-3 bg-light border rounded text-dark">"{getContenido(seleccionado)}"</div>
                        </div>
                    )}

                    {vistaActiva === 'reportar' && seleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #dc3545' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-danger" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-flag me-2"></i>Reportar Comentario #{seleccionado.id}</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <p className="text-muted small mb-3">Comentario a reportar: <br /><strong>"{getContenido(seleccionado)}"</strong> — <em>{getUsuario(seleccionado)}</em></p>
                            <form onSubmit={handleEnviarReporte}>
                                <div className="mb-3">
                                    <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Tipo de Reporte / Motivo:</label>
                                    <select 
                                        className="form-select form-select-sm text-dark bg-white" 
                                        value={form.data.motivo} 
                                        onChange={(e) => form.setData('motivo', e.target.value)} 
                                        required
                                    >
                                        <option value="Contenido ofensivo">Contenido ofensivo</option>
                                        <option value="Spam">Spam</option>
                                        <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                                        <option value="Spoilers">Spoilers</option>
                                        <option value="Otro motivo">Otro motivo</option>
                                    </select>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setVistaActiva('tabla')}>Cancelar</button>
                                    <button type="submit" className="btn btn-danger btn-sm px-4" disabled={form.processing}>{form.processing ? 'Enviando...' : 'Enviar Reporte a Moderación'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Barra de Filtros Avanzados */}
                    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
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
                            <option value="comentario">Comentario</option>
                            <option value="motivo">Motivo</option>
                            <option value="fecha">Fecha</option>
                            <option value="estado">Estado</option>
                        </select>

                        {columnaFiltro === 'motivo' ? (
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ maxWidth: '220px', fontSize: '0.8rem' }}
                                value={motivoFiltro}
                                onChange={(e) => setMotivoFiltro(e.target.value)}
                            >
                                <option value="">Todos los motivos</option>
                                <option value="Contenido ofensivo">Contenido ofensivo</option>
                                <option value="Spam">Spam</option>
                                <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                                <option value="Spoilers">Spoilers</option>
                                <option value="Otro motivo">Otro motivo</option>
                            </select>
                        ) : columnaFiltro === 'estado' ? (
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="revisado">Revisado</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="archivado">Archivado</option>
                            </select>
                        ) : columnaFiltro === 'fecha' ? (
                            <input
                                type="text"
                                className="form-control form-control-sm bg-white text-dark border"
                                style={{ maxWidth: '180px', fontSize: '0.8rem' }}
                                placeholder="DD/MM/AAAA"
                                maxLength={10}
                                value={fechaFiltro}
                                onChange={handleFechaInput}
                            />
                        ) : (
                            <input
                                type="text"
                                className="form-control form-control-sm bg-white text-dark border"
                                style={{ maxWidth: '250px', fontSize: '0.8rem' }}
                                placeholder={columnaFiltro !== 'todos' ? `Buscar por ${columnaFiltro}...` : 'Buscar ID, usuario, película...'}
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        )}

                        {(busqueda || motivoFiltro || estadoFiltro || fechaFiltro || columnaFiltro !== 'todos') && (
                            <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                <i className="fas fa-times me-1"></i>Limpiar
                            </button>
                        )}
                    </div>

                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th style={{ width: '60px' }}>ID</th>
                                        <th>Usuario</th>
                                        <th>Película</th>
                                        <th>Comentario</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '110px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comentariosFiltrados.length > 0 ? comentariosFiltrados.map((c) => (
                                        <tr key={c.id}>
                                            <td className="text-muted">#{c.id}</td>
                                            <td className="fw-semibold text-dark">{getUsuario(c)}</td>
                                            <td><span className="badge bg-secondary">{getPelicula(c)}</span></td>
                                            <td className="text-muted text-truncate" style={{ maxWidth: '280px' }}>"{getContenido(c)}"</td>
                                            <td className="text-muted">{getFechaVisual(c.created_at)}</td>
                                            <td className="text-center">{renderBadgeEstado(c.estado)}</td>
                                            <td className="text-center">
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button className="btn btn-outline-secondary" onClick={() => handleVer(c)} title="Ver"><i className="fas fa-eye"></i></button>
                                                    <button className="btn btn-outline-warning text-dark" onClick={() => handleReportar(c)} title="Reportar"><i className="fas fa-flag"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="text-center py-4 text-muted">No hay comentarios con los criterios especificados.</td></tr>
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