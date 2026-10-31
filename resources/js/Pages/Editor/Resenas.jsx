import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StatusBadge } from '@/Components/AdminWidgets';
import { useForm, router, usePage } from '@inertiajs/react';

export default function EditorResenas({ auth, resenas = [], peliculas = [] }) {
    const { flash } = usePage().props;
    const listaResenas = Array.isArray(resenas) ? resenas : (resenas?.data ?? []);
    const listaPeliculas = Array.isArray(peliculas) ? peliculas : (peliculas?.data ?? []);

    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' | 'nueva' | 'editar' | 'ver'
    const [seleccionada, setSeleccionada] = useState(null);
    const tableRef = useRef(null);

    // Estados para los filtros
    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [calificacionFiltro, setCalificacionFiltro] = useState('');

    const [mostrarFlash, setMostrarFlash] = useState(false);
    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const t = setTimeout(() => setMostrarFlash(false), 3000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const form = useForm({ pelicula_id: '', titulo: '', contenido: '', calificacion: '', estado: 'borrador' });
    const formEdit = useForm({ id: '', pelicula_id: '', titulo: '', contenido: '', calificacion: '', estado: 'borrador' });

    const esActivaVisual = (r) => (r.estado || '').toLowerCase() !== 'archivada';

    // 1. Obtener IDs de películas bloqueadas (Solo las que tengan reseña VIGENTE: publicada o borrador Y con activa = 1 / true)
    const peliculasOcupadas = listaResenas
        .filter(r => {
            const estadoResena = String(r.estado || '').toLowerCase().trim();
            const esActiva = Boolean(r.activa) && String(r.activa) !== '0';

            // Si está archivada o desactivada (0), NO bloquea la película
            if (estadoResena === 'archivada' || !esActiva) {
                return false;
            }
            return estadoResena === 'publicada' || estadoResena === 'borrador';
        })
        .map(r => Number(r.pelicula_id));

    // 2. Filtrar películas elegibles
    const peliculasDisponibles = listaPeliculas.filter(p => {
        // La película debe estar activa en la BD (o ser 1/true) y su estado general ser 'publicada'
        const peliEstaActiva = Boolean(p.activa) && String(p.activa) !== '0';
        const peliPublicada = String(p.estado || '').toLowerCase().trim() === 'publicada';

        if (!peliEstaActiva || !peliPublicada) return false;

        // Si estamos editando una reseña existente, permitir mantener seleccionada su película original
        if (vistaActiva === 'editar' && seleccionada && Number(seleccionada.pelicula_id) === Number(p.id)) {
            return true;
        }

        // Si la película NO está en la lista de ocupadas, estará DISPONIBLE
        return !peliculasOcupadas.includes(Number(p.id));
    });

    const scrollTable = (dir) => { 
        if (tableRef.current) tableRef.current.scrollBy({ top: dir === 'down' ? 200 : -200, behavior: 'smooth' }); 
    };

    const handleGuardar = (e) => {
        e.preventDefault();
        form.post(route('editor.resenas.store'), { 
            preserveScroll: true,
            onSuccess: () => { form.reset(); setVistaActiva('tabla'); } 
        });
    };

    const handleActualizar = (e) => {
        e.preventDefault();
        formEdit.put(route('editor.resenas.update', formEdit.data.id), { 
            preserveScroll: true,
            onSuccess: () => setVistaActiva('tabla') 
        });
    };

    const handleEditar = (r) => {
        setSeleccionada(r);
        formEdit.setData({
            id: r.id, 
            pelicula_id: r.pelicula_id, 
            titulo: r.titulo,
            contenido: r.contenido, 
            calificacion: r.calificacion, 
            estado: (r.estado || 'borrador').toLowerCase(),
        });
        setVistaActiva('editar');
    };

    const handleVer = (r) => { 
        setSeleccionada(r); 
        setVistaActiva('ver'); 
    };

    const handleToggle = (r) => {
        const activa = esActivaVisual(r);
        if (confirm(`¿Deseas ${activa ? 'archivar' : 'restaurar'} la reseña "${r.titulo}"?`)) {
            router.delete(route('editor.resenas.destroy', r.id), { preserveScroll: true, preserveState: true });
        }
    };

    const handleCambioColumna = (e) => {
        setColumnaFiltro(e.target.value);
        setBusqueda('');
        setValorSelectFiltro('');
        setFechaFiltro('');
        setCalificacionFiltro('');
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setValorSelectFiltro('');
        setFechaFiltro('');
        setCalificacionFiltro('');
        setColumnaFiltro('todos');
    };

    // Auto-formateador con máscara dinámica DD/MM/AAAA mientras escribe (bloquea letras)
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

    const formatearFechaAVisual = (raw) => {
        if (!raw) return 'N/A';
        const str = String(raw).trim().split('T')[0].split(' ')[0];
        if (str.includes('-')) {
            const partes = str.split('-');
            if (partes.length === 3) {
                const [yyyy, mm, dd] = partes;
                return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
            }
        }
        if (str.includes('/')) return str;
        return 'N/A';
    };

    const resenasFiltradas = listaResenas.filter((r) => {
        const tituloPeli = (r.pelicula?.titulo || '').toLowerCase();
        const tituloResena = (r.titulo || '').toLowerCase();
        const estado = (r.estado || '').toLowerCase();
        
        const rawFecha = r.creado || r.created_at;
        const fechaVisual = formatearFechaAVisual(rawFecha);

        const calificacionStr = String(Math.floor(Number(r.calificacion || 0)));

        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return estado === valorSelectFiltro.toLowerCase();
        }
        if (columnaFiltro === 'fecha') {
            if (!fechaFiltro) return true;
            return fechaVisual.includes(fechaFiltro.trim());
        }
        if (columnaFiltro === 'calificacion') {
            if (!calificacionFiltro) return true;
            return calificacionStr === calificacionFiltro;
        }

        const val = busqueda.toLowerCase().trim();
        if (!val) return true;

        switch (columnaFiltro) {
            case 'titulo':
                return tituloResena.includes(val);
            case 'pelicula':
                return tituloPeli.includes(val);
            default:
                return tituloResena.includes(val) || tituloPeli.includes(val) || estado.includes(val) || fechaVisual.includes(val);
        }
    });

    return (
        <AuthenticatedLayout auth={auth} title="Mis Reseñas">
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
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>Mis Reseñas</h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>Escribe y administra las reseñas de tus propias películas.</p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 180px)' }}>
                <div className="container-fluid px-4 px-lg-5">

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
                                <option value="pelicula">Película</option>
                                <option value="estado">Estado</option>
                                <option value="calificacion">Calificación</option>
                                <option value="fecha">Fecha</option>
                            </select>

                            {columnaFiltro === 'estado' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione estado...</option>
                                    <option value="publicada">Publicada</option>
                                    <option value="borrador">Borrador</option>
                                    <option value="archivada">Archivada</option>
                                </select>
                            ) : columnaFiltro === 'calificacion' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    value={calificacionFiltro}
                                    onChange={(e) => setCalificacionFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione calificación...</option>
                                    <option value="5">★★★★★ (5 Estrellas)</option>
                                    <option value="4">★★★★☆ (4 Estrellas)</option>
                                    <option value="3">★★★☆☆ (3 Estrellas)</option>
                                    <option value="2">★★☆☆☆ (2 Estrellas)</option>
                                    <option value="1">★☆☆☆☆ (1 Estrella)</option>
                                    <option value="0">☆☆☆☆☆ (0 Estrellas)</option>
                                </select>
                            ) : columnaFiltro === 'fecha' ? (
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    placeholder="DD/MM/AAAA"
                                    maxLength={10}
                                    value={fechaFiltro}
                                    onChange={handleFechaInput}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-white text-dark border"
                                    style={{ maxWidth: '220px', fontSize: '0.8rem' }}
                                    placeholder={columnaFiltro !== 'todos' ? `Buscar por ${columnaFiltro}...` : 'Buscar reseña...'}
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            )}

                            {(busqueda || valorSelectFiltro || fechaFiltro || calificacionFiltro || columnaFiltro !== 'todos') && (
                                <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                    <i className="fas fa-times me-1"></i>Limpiar
                                </button>
                            )}
                        </div>

                        <div className="d-flex gap-2">
                            <div className="btn-group btn-group-sm" role="group">
                                <button className="btn btn-sm btn-light border" onClick={() => scrollTable('up')} style={{ height: '31px' }} title="Subir"><i className="fas fa-chevron-up"></i></button>
                                <button className="btn btn-sm btn-light border" onClick={() => scrollTable('down')} style={{ height: '31px' }} title="Bajar"><i className="fas fa-chevron-down"></i></button>
                            </div>
                            <button className="btn btn-sm btn-primary d-flex align-items-center px-3" style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }} onClick={() => setVistaActiva('nueva')}>
                                <i className="fas fa-plus me-2"></i>Nueva Reseña
                            </button>
                        </div>
                    </div>

                    {vistaActiva === 'nueva' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #0d6efd' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-pen-nib me-2 text-primary"></i>Nueva Reseña</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <form onSubmit={handleGuardar}>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Película</label>
                                        <select className="form-select form-select-sm text-dark" value={form.data.pelicula_id} onChange={(e) => form.setData('pelicula_id', e.target.value)} required>
                                            <option value="">Seleccionar...</option>
                                            {peliculasDisponibles.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                                        </select>
                                        {peliculasDisponibles.length === 0 && <small className="text-danger d-block mt-1">No hay películas publicadas pendientes por reseñar.</small>}
                                        {form.errors.pelicula_id && <span className="text-danger small">{form.errors.pelicula_id}</span>}
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Título de la reseña</label>
                                        <input type="text" className="form-control form-control-sm text-dark" value={form.data.titulo} onChange={(e) => form.setData('titulo', e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Calificación (0-5)</label>
                                        <input type="number" step="0.1" min="0" max="5" className="form-control form-control-sm text-dark" value={form.data.calificacion} onChange={(e) => form.setData('calificacion', e.target.value)} required />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Contenido</label>
                                        <textarea className="form-control form-control-sm text-dark" rows="3" value={form.data.contenido} onChange={(e) => form.setData('contenido', e.target.value)} required></textarea>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Estado</label>
                                        <select className="form-select form-select-sm text-dark" value={form.data.estado} onChange={(e) => form.setData('estado', e.target.value)}>
                                            <option value="borrador">Borrador</option>
                                            <option value="publicada">Publicada</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end">
                                        <button type="submit" className="btn btn-primary btn-sm px-4" disabled={form.processing || peliculasDisponibles.length === 0}>{form.processing ? 'Guardando...' : 'Guardar Reseña'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {vistaActiva === 'editar' && seleccionada && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #198754' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-edit me-2 text-success"></i>Editar: {seleccionada.titulo}</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <form onSubmit={handleActualizar}>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Película</label>
                                        <select className="form-select form-select-sm text-dark" value={formEdit.data.pelicula_id} onChange={(e) => formEdit.setData('pelicula_id', e.target.value)} required>
                                            {peliculasDisponibles.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Título</label>
                                        <input type="text" className="form-control form-control-sm text-dark" value={formEdit.data.titulo} onChange={(e) => formEdit.setData('titulo', e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Calificación</label>
                                        <input type="number" step="0.1" min="0" max="5" className="form-control form-control-sm text-dark" value={formEdit.data.calificacion} onChange={(e) => formEdit.setData('calificacion', e.target.value)} required />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Contenido</label>
                                        <textarea className="form-control form-control-sm text-dark" rows="3" value={formEdit.data.contenido} onChange={(e) => formEdit.setData('contenido', e.target.value)} required></textarea>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Estado</label>
                                        <select className="form-select form-select-sm text-dark" value={formEdit.data.estado} onChange={(e) => formEdit.setData('estado', e.target.value)}>
                                            <option value="borrador">Borrador</option>
                                            <option value="publicada">Publicada</option>
                                            <option value="archivada">Archivada</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end">
                                        <button type="submit" className="btn btn-success btn-sm px-4" disabled={formEdit.processing}>{formEdit.processing ? 'Guardando...' : 'Actualizar Reseña'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {vistaActiva === 'ver' && seleccionada && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-eye me-2 text-secondary"></i>{seleccionada.titulo}</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <p className="mb-1 text-dark"><strong>Película:</strong> {seleccionada.pelicula?.titulo || 'N/A'}</p>
                            <p className="mb-1 text-dark"><strong>Calificación:</strong> ★ {seleccionada.calificacion}</p>
                            <p className="mb-1 text-dark"><strong>Estado:</strong> <StatusBadge status={seleccionada.estado} /></p>
                            <hr className="my-2" />
                            <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{seleccionada.contenido}</p>
                        </div>
                    )}

                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                        <div ref={tableRef} className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Película</th><th>Título</th><th className="text-center">Calificación</th>
                                        <th className="text-center">Estado</th><th>Fecha</th>
                                        <th className="text-center" style={{ width: '130px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resenasFiltradas.length > 0 ? resenasFiltradas.map((r) => {
                                        const activa = esActivaVisual(r);
                                        const fechaVisual = formatearFechaAVisual(r.creado || r.created_at);

                                        return (
                                            <tr key={r.id} style={{ opacity: activa ? 1 : 0.55 }}>
                                                <td className="text-dark">{r.pelicula?.titulo || 'N/A'}</td>
                                                <td className="fw-semibold text-dark">{r.titulo}</td>
                                                <td className="text-center fw-bold text-warning">★ {r.calificacion}</td>
                                                <td className="text-center"><StatusBadge status={r.estado} /></td>
                                                <td className="text-muted">{fechaVisual}</td>
                                                <td className="text-center">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <button className="btn btn-outline-secondary" onClick={() => handleVer(r)} title="Ver"><i className="fas fa-eye"></i></button>
                                                        <button className="btn btn-outline-primary" onClick={() => handleEditar(r)} title="Editar"><i className="fas fa-pen"></i></button>
                                                        <button className={`btn ${activa ? 'btn-outline-danger' : 'btn-success'}`} onClick={() => handleToggle(r)} title={activa ? 'Archivar' : 'Restaurar'}>
                                                            <i className={`fas ${activa ? 'fa-trash-alt' : 'fa-undo'}`}></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">No se encontraron reseñas con los criterios especificados.</td></tr>
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

