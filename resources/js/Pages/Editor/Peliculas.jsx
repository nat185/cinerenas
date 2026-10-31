import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StatusBadge } from '@/Components/AdminWidgets';
import { useForm, router, usePage } from '@inertiajs/react';

const PLATAFORMAS_AUTORIZADAS = [
    'Netflix', 'Max', 'Disney+', 'Amazon Prime Video',
    'Apple TV+', 'Paramount+', 'MUBI', 'Claro Video',
    'Pluto TV', 'Tubi', 'Plex', 'Mercado Play'
];

const PAISES_DISPONIBLES = [
    'México', 'Estados Unidos', 'España', 'Argentina', 'Francia',
    'Reino Unido', 'Japón', 'Corea del Sur', 'Italia', 'Alemania',
    'Canadá', 'Brasil', 'Colombia', 'Chile', 'Otro'
];

export default function EditorPeliculas({ auth, peliculas = [], generos = [] }) {
    const { flash } = usePage().props;
    const listaPeliculas = Array.isArray(peliculas) ? peliculas : (peliculas?.data ?? []);

    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [anioFiltro, setAnioFiltro] = useState('');
    const [plataformaFiltro, setPlataformaFiltro] = useState('');

    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' | 'nueva' | 'editar' | 'ver'
    const [seleccionada, setSeleccionada] = useState(null);
    const [imagenInfo, setImagenInfo] = useState({ tipo: 'N/A', peso: 'N/A', medidas: 'N/A' });
    const [posterZoom, setPosterZoom] = useState(false);
    
    const [modalPoster, setModalPoster] = useState({ abierto: false, url: '', titulo: '' });
    const [mostrarInfoModal, setMostrarInfoModal] = useState(false);
   
    const [mensajeErrorForm, setMensajeErrorForm] = useState(null);

    const formRef = useRef(null);
    const tableRef = useRef(null);

    const [mostrarFlash, setMostrarFlash] = useState(false);
    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const t = setTimeout(() => setMostrarFlash(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const currentYear = new Date().getFullYear();

    const form = useForm({
        titulo: '', genero_id: '', anio: currentYear, director: '', elenco: '', duracion_min: '',
        pais: 'México', plataformas: [], sinopsis: '', trailer_url: '', estado: 'borrador', poster: null,
    });

    const formEdit = useForm({
        id: '', titulo: '', genero_id: '', anio: currentYear, director: '', elenco: '', duracion_min: '',
        pais: 'México', plataformas: [], sinopsis: '', trailer_url: '', estado: 'borrador', poster: null,
    });

    const scrollToFormSection = () => {
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFileChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        const targetForm = isEdit ? formEdit : form;

        if (!file) {
            targetForm.setData('poster', null);
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Formato no válido. Solo se permiten archivos JPG, PNG y WEBP.');
            e.target.value = null;
            targetForm.setData('poster', null);
            return;
        }

        const maxSizeKB = 200;
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > maxSizeKB) {
            alert(`El archivo es demasiado pesado (${fileSizeKB.toFixed(1)} KB). El peso máximo permitido es de 200 KB.`);
            e.target.value = null;
            targetForm.setData('poster', null);
            return;
        }

        targetForm.setData('poster', file);
    };

    const getTitulo = (p) => p.titulo || 'Sin título';
    const getGenero = (p) => p.genero?.nombre || 'Sin género';

    const getPoster = (p) => {
        if (!p.poster_path) return null;
        if (p.poster_path.startsWith('http') || p.poster_path.startsWith('/')) return p.poster_path;
        return `/storage/${p.poster_path}`;
    };

    const esActiva = (p) => !(p.activa === false || p.activa === 0 || p.activa === '0' || p.estado === 'archivada');

    const aniosDisponibles = [];
    for (let y = currentYear; y >= 1900; y--) {
        aniosDisponibles.push(y);
    }

    const limpiarFiltros = () => {
        setColumnaFiltro('todos');
        setBusqueda('');
        setValorSelectFiltro('');
        setAnioFiltro('');
        setPlataformaFiltro('');
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
            let extension = url.split('.').pop().split(/\#|\?/)[0].toUpperCase();
            if (!['JPG', 'JPEG', 'PNG', 'WEBP'].includes(extension)) extension = 'WEBP/JPEG';
           
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const sizeKB = (blob.size / 1024).toFixed(1);
                    setImagenInfo({
                        tipo: extension,
                        peso: `${sizeKB} KB`,
                        medidas: `${width} x ${height} px`
                    });
                })
                .catch(() => {
                    setImagenInfo({
                        tipo: extension,
                        peso: 'Desconocido',
                        medidas: `${width} x ${height} px`
                    });
                });
        };
        img.onerror = () => {
            setImagenInfo({ tipo: 'N/A', peso: 'N/A', medidas: 'N/A' });
        };
    };

    const abrirModalPoster = (peli, e) => {
        e.stopPropagation();
        const url = getPoster(peli);
        analizarImagenPoster(url);
        setMostrarInfoModal(false);
        setModalPoster({ abierto: true, url: url, titulo: getTitulo(peli) });
    };

    const cerrarModalPoster = () => {
        setModalPoster({ abierto: false, url: '', titulo: '' });
        setMostrarInfoModal(false);
    };

    const peliculasFiltradas = listaPeliculas.filter((p) => {
        const val = busqueda.toLowerCase().trim();
        const titulo = getTitulo(p).toLowerCase();
        const genero = getGenero(p).toLowerCase();
        const director = (p.director || '').toLowerCase();
        const idStr = String(p.id);
        const estado = (p.estado || '').toLowerCase();
        const anioStr = String(p.anio || '');
       
        let plataformasStr = '';
        if (Array.isArray(p.plataformas_streaming)) {
            plataformasStr = p.plataformas_streaming.join(', ').toLowerCase();
        } else if (typeof p.plataformas_streaming === 'string') {
            plataformasStr = p.plataformas_streaming.toLowerCase();
        }

        if (columnaFiltro === 'id') return !val || idStr.includes(val);
        if (columnaFiltro === 'titulo') return !val || titulo.includes(val);
        if (columnaFiltro === 'director') return !val || director.includes(val);
        if (columnaFiltro === 'genero') {
            if (!valorSelectFiltro) return true;
            return String(p.genero_id) === String(valorSelectFiltro);
        }
        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return estado === valorSelectFiltro.toLowerCase();
        }
        if (columnaFiltro === 'anio') {
            if (!anioFiltro) return true;
            return anioStr === String(anioFiltro);
        }
        if (columnaFiltro === 'plataforma') {
            if (!plataformaFiltro) return true;
            return plataformasStr.includes(plataformaFiltro.toLowerCase());
        }

        if (!val) return true;
        return titulo.includes(val) || genero.includes(val) || director.includes(val) || idStr.includes(val) || plataformasStr.includes(val);
    });

    const handlePlataformaChange = (plat, isEdit = false) => {
        const targetForm = isEdit ? formEdit : form;
        const currentPlats = [...targetForm.data.plataformas];
        const index = currentPlats.indexOf(plat);
        if (index > -1) {
            currentPlats.splice(index, 1);
        } else {
            currentPlats.push(plat);
        }
        targetForm.setData('plataformas', currentPlats);
    };

    const handleGuardar = (e) => {
        e.preventDefault();
        setMensajeErrorForm(null);
        

        form.post('/editor/peliculas', {
            preserveScroll: true,
            onSuccess: () => { 
                form.reset(); 
                setVistaActiva('tabla'); 
                setMensajeErrorForm(null);
            },
            onError: (errors) => {
                if (errors.titulo) {
                    form.setError('titulo', errors.titulo);
                    setMensajeErrorForm(errors.titulo);
                } else {
                    setMensajeErrorForm('Por favor verifica los datos ingresados en el formulario.');
                }
                scrollToFormSection();
            }
        });
    };

    const handleActualizar = (e) => {
        e.preventDefault();
        setMensajeErrorForm(null);
        
        formEdit.data._method = 'PUT';

        formEdit.post(`/editor/peliculas/${formEdit.data.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setVistaActiva('tabla');
                setMensajeErrorForm(null);
            },
            onError: (errors) => {
                if (errors.titulo) {
                    formEdit.setError('titulo', errors.titulo);
                    setMensajeErrorForm(errors.titulo);
                } else {
                    setMensajeErrorForm('Por favor verifica los datos ingresados en el formulario.');
                }
                scrollToFormSection();
            }
        });
    };

    const handleAbrirNueva = () => {
        setVistaActiva('nueva');
        setMensajeErrorForm(null);
        scrollToFormSection();
    };

    const handleEditar = (p) => {
        setSeleccionada(p);
        setMensajeErrorForm(null);
        let platsArray = [];
        if (Array.isArray(p.plataformas_streaming)) {
            platsArray = p.plataformas_streaming;
        } else if (typeof p.plataformas_streaming === 'string' && p.plataformas_streaming) {
            platsArray = p.plataformas_streaming.split(',').map(s => s.trim());
        }

        formEdit.setData({
            id: p.id,
            titulo: p.titulo || '',
            genero_id: p.genero_id || '',
            anio: p.anio || currentYear,
            director: p.director || '',
            elenco: p.elenco || '',
            duracion_min: p.duracion_min || '',
            pais: p.pais || 'México',
            plataformas: platsArray,
            sinopsis: p.sinopsis || '',
            trailer_url: p.trailer_url || '',
            estado: (p.estado || 'borrador').toLowerCase(),
            poster: null,
        });
        setVistaActiva('editar');
        scrollToFormSection();
    };

    const handleVer = (p) => {
        setSeleccionada(p);
        setPosterZoom(false);
        analizarImagenPoster(getPoster(p));
        setVistaActiva('ver');
        scrollToFormSection();
    };

    const handleToggle = (p) => {
        const activa = esActiva(p);
        if (confirm(`¿Deseas ${activa ? 'archivar e inhabilitar' : 'reactivar y publicar'} "${getTitulo(p)}"?`)) {
            router.delete(`/editor/peliculas/${p.id}`, { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout auth={auth} title="Mis Películas">
            {/* MENSAJE DE ERROR FLOTANTE SUPERIOR EN ROJO */}
            {mensajeErrorForm && (
                <div className="alert alert-danger shadow py-2 px-3 d-flex align-items-center"
                    style={{ 
                        position: 'fixed', 
                        top: '20px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        zIndex: 10000, 
                        fontSize: '0.85rem', 
                        borderRadius: '6px', 
                        minWidth: '320px',
                        maxWidth: '550px' 
                    }}>
                    <i className="fas fa-exclamation-triangle me-2 fs-5 text-danger"></i>
                    <div className="flex-grow-1 text-dark fw-bold">{mensajeErrorForm}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.65rem' }} onClick={() => setMensajeErrorForm(null)}></button>
                </div>
            )}

            {/* ALERTA DE ÉXITO / FLASH INFERIOR */}
            {mostrarFlash && (flash?.message || flash?.error) && (
                <div className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.8rem', borderRadius: '4px', maxWidth: '380px' }}>
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setMostrarFlash(false)}></button>
                </div>
            )}

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
                        padding: '20px'
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
                            alignItems: 'center'
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
                                transition: 'all 0.2s'
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
                                    cursor: 'crosshair'
                                }}
                                onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                            />

                            {mostrarInfoModal && (
                                <div style={{
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
                                    zIndex: 5
                                }}>
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

            <section style={{
                position: 'relative', minHeight: '180px', paddingTop: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: '600', letterSpacing: '-0.02em' }}>Catálogo de Películas</h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Visualiza y administra las películas del sistema, controlando metadatos, estados y catálogos de streaming.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 180px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <select
                                className="form-select form-select-sm bg-white text-dark border"
                                style={{ width: '160px', fontSize: '0.8rem' }}
                                value={columnaFiltro}
                                onChange={(e) => {
                                    setColumnaFiltro(e.target.value);
                                    setBusqueda('');
                                    setValorSelectFiltro('');
                                    setAnioFiltro('');
                                    setPlataformaFiltro('');
                                }}
                            >
                                <option value="todos">Filtrar por...</option>
                                <option value="id">ID</option>
                                <option value="titulo">Título</option>
                                <option value="director">Director</option>
                                <option value="genero">Género</option>
                                <option value="estado">Estado</option>
                                <option value="anio">Año</option>
                                <option value="plataforma">Plataforma</option>
                            </select>

                            {columnaFiltro === 'genero' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ width: '200px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione género...</option>
                                    {generos.filter(g => g.activo === 1 || g.activo === true || g.activo === '1').map(g => (
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
                            ) : columnaFiltro === 'anio' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ width: '200px', fontSize: '0.8rem' }}
                                    value={anioFiltro}
                                    onChange={(e) => setAnioFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione año...</option>
                                    {aniosDisponibles.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            ) : columnaFiltro === 'plataforma' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ width: '200px', fontSize: '0.8rem' }}
                                    value={plataformaFiltro}
                                    onChange={(e) => setPlataformaFiltro(e.target.value)}
                                >
                                    <option value="">Seleccione plataforma...</option>
                                    {PLATAFORMAS_AUTORIZADAS.map(plat => (
                                        <option key={plat} value={plat}>{plat}</option>
                                    ))}
                                </select>
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

                            {(busqueda || valorSelectFiltro || anioFiltro || plataformaFiltro || columnaFiltro !== 'todos') && (
                                <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                    <i className="fas fa-times me-1"></i>Limpiar
                                </button>
                            )}
                        </div>

                        <button className="btn btn-sm btn-primary d-flex align-items-center px-3" style={{ fontSize: '0.8rem', borderRadius: '4px', height: '31px' }} onClick={handleAbrirNueva}>
                            <i className="fas fa-plus me-2"></i>Agregar Película
                        </button>
                    </div>

                    {vistaActiva === 'nueva' && (
                        <div ref={formRef} className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #0d6efd' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-film me-2 text-primary"></i>Registrar Nueva Película</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <form onSubmit={handleGuardar}>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <label className="form-label text-dark small fw-bold">Título *</label>
                                        <input 
                                            type="text" 
                                            className={`form-control form-control-sm text-dark ${form.errors.titulo ? 'is-invalid' : ''}`} 
                                            value={form.data.titulo} 
                                            onChange={(e) => form.setData('titulo', e.target.value)} 
                                            required 
                                        />
                                        {form.errors.titulo && (
                                            <div className="text-danger small mt-1" style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>
                                                {form.errors.titulo}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-dark small fw-bold">Género *</label>
                                        <select className="form-select form-select-sm text-dark" value={form.data.genero_id} onChange={(e) => form.setData('genero_id', e.target.value)} required>
                                            <option value="">Seleccione género...</option>
                                            {generos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Año *</label>
                                        <input type="number" className="form-control form-control-sm text-dark" value={form.data.anio} onChange={(e) => form.setData('anio', e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Estado *</label>
                                        <select className="form-select form-select-sm text-dark" value={form.data.estado} onChange={(e) => form.setData('estado', e.target.value)}>
                                            <option value="borrador">Borrador</option>
                                            <option value="publicada">Publicada</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-dark small fw-bold">Director</label>
                                        <input type="text" className="form-control form-control-sm text-dark" value={form.data.director} onChange={(e) => form.setData('director', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-dark small fw-bold">País</label>
                                        <select className="form-select form-select-sm text-dark" value={form.data.pais} onChange={(e) => form.setData('pais', e.target.value)}>
                                            {PAISES_DISPONIBLES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Duración (min)</label>
                                        <input type="number" className="form-control form-control-sm text-dark" value={form.data.duracion_min} onChange={(e) => form.setData('duracion_min', e.target.value)} placeholder="Ej. 120" />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Póster de la Película (Imagen)</label>
                                        <input type="file" className="form-control form-control-sm text-dark" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleFileChange(e, false)} />
                                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Formatos: JPG, PNG, WEBP (Max. 200 KB)</small>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-dark small fw-bold">Elenco (Reparto principal)</label>
                                        <input type="text" className="form-control form-control-sm text-dark" value={form.data.elenco} onChange={(e) => form.setData('elenco', e.target.value)} placeholder="Ej. Actor 1, Actor 2..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-dark small fw-bold">URL del Tráiler (YouTube)</label>
                                        <input type="url" className="form-control form-control-sm text-dark" value={form.data.trailer_url} onChange={(e) => form.setData('trailer_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-dark small fw-bold d-block">Plataformas de Streaming</label>
                                        <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light" style={{ maxHeight: '110px', overflowY: 'auto' }}>
                                            {PLATAFORMAS_AUTORIZADAS.map(plat => (
                                                <div key={plat} className="form-check form-check-inline m-0" style={{ fontSize: '0.8rem' }}>
                                                    <input type="checkbox" className="form-check-input" id={`plat_new_${plat}`} checked={form.data.plataformas.includes(plat)} onChange={() => handlePlataformaChange(plat, false)} />
                                                    <label className="form-check-label text-dark ms-1" htmlFor={`plat_new_${plat}`}>{plat}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-dark small fw-bold">Sinopsis</label>
                                        <textarea className="form-control form-control-sm text-dark" rows="3" value={form.data.sinopsis} onChange={(e) => form.setData('sinopsis', e.target.value)}></textarea>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end mt-2">
                                        <button type="submit" className="btn btn-primary btn-sm px-4" disabled={form.processing}>{form.processing ? 'Guardando...' : 'Guardar Película'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {vistaActiva === 'editar' && seleccionada && (
                        <div ref={formRef} className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #198754' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}><i className="fas fa-edit me-2 text-success"></i>Editar: {getTitulo(seleccionada)}</h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}><i className="fas fa-arrow-left me-1"></i> Regresar</button>
                            </div>
                            <form onSubmit={handleActualizar}>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <label className="form-label text-dark small fw-bold">Título *</label>
                                        <input 
                                            type="text" 
                                            className={`form-control form-control-sm text-dark ${formEdit.errors.titulo ? 'is-invalid' : ''}`} 
                                            value={formEdit.data.titulo} 
                                            onChange={(e) => formEdit.setData('titulo', e.target.value)} 
                                            required 
                                        />
                                        {formEdit.errors.titulo && (
                                            <div className="text-danger small mt-1" style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>
                                                {formEdit.errors.titulo}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-dark small fw-bold">Género *</label>
                                        <select className="form-select form-select-sm text-dark" value={formEdit.data.genero_id} onChange={(e) => formEdit.setData('genero_id', e.target.value)} required>
                                            {generos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Año *</label>
                                        <input type="number" className="form-control form-control-sm text-dark" value={formEdit.data.anio} onChange={(e) => formEdit.setData('anio', e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Estado *</label>
                                        <select className="form-select form-select-sm text-dark" value={formEdit.data.estado} onChange={(e) => formEdit.setData('estado', e.target.value)}>
                                            <option value="borrador">Borrador</option>
                                            <option value="publicada">Publicada</option>
                                            <option value="archivada">Archivada</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-dark small fw-bold">Director</label>
                                        <input type="text" className="form-control form-control-sm text-dark" value={formEdit.data.director} onChange={(e) => formEdit.setData('director', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-dark small fw-bold">País</label>
                                        <select className="form-select form-select-sm text-dark" value={formEdit.data.pais} onChange={(e) => formEdit.setData('pais', e.target.value)}>
                                            {PAISES_DISPONIBLES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Duración (min)</label>
                                        <input type="number" className="form-control form-control-sm text-dark" value={formEdit.data.duracion_min} onChange={(e) => formEdit.setData('duracion_min', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label text-dark small fw-bold">Póster de la Película (Imagen)</label>
                                        <input type="file" className="form-control form-control-sm text-dark" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleFileChange(e, true)} />
                                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Formatos: JPG, PNG, WEBP (Max. 200 KB)</small>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-dark small fw-bold">Elenco</label>
                                        <input type="text" className="form-control form-control-sm text-dark" value={formEdit.data.elenco} onChange={(e) => formEdit.setData('elenco', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-dark small fw-bold">URL del Tráiler</label>
                                        <input type="url" className="form-control form-control-sm text-dark" value={formEdit.data.trailer_url} onChange={(e) => formEdit.setData('trailer_url', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-dark small fw-bold d-block">Plataformas de Streaming</label>
                                        <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light" style={{ maxHeight: '110px', overflowY: 'auto' }}>
                                            {PLATAFORMAS_AUTORIZADAS.map(plat => (
                                                <div key={plat} className="form-check form-check-inline m-0" style={{ fontSize: '0.8rem' }}>
                                                    <input type="checkbox" className="form-check-input" id={`plat_edit_${plat}`} checked={formEdit.data.plataformas.includes(plat)} onChange={() => handlePlataformaChange(plat, true)} />
                                                    <label className="form-check-label text-dark ms-1" htmlFor={`plat_edit_${plat}`}>{plat}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label text-dark small fw-bold">Sinopsis</label>
                                        <textarea className="form-control form-control-sm text-dark" rows="3" value={formEdit.data.sinopsis} onChange={(e) => formEdit.setData('sinopsis', e.target.value)}></textarea>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end mt-2">
                                        <button type="submit" className="btn btn-success btn-sm px-4" disabled={formEdit.processing}>{formEdit.processing ? 'Actualizando...' : 'Actualizar Película'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {vistaActiva === 'ver' && seleccionada && (
                        <div ref={formRef} className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '4px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                                    <i className="fas fa-eye me-2 text-secondary"></i>Detalles de Película: <span className="text-primary">{getTitulo(seleccionada)}</span>
                                </h4>
                                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setVistaActiva('tabla')} style={{ fontSize: '0.8rem' }}>
                                    <i className="fas fa-arrow-left me-1"></i> Regresar
                                </button>
                            </div>

                            <div className="row g-4 align-items-start">
                                <div className="col-md-3 text-center d-flex flex-column align-items-center">
                                    <div 
                                        style={{ 
                                            position: 'relative', 
                                            display: 'inline-block',
                                            cursor: 'pointer' 
                                        }}
                                        onClick={() => {
                                            if (!posterZoom) analizarImagenPoster(getPoster(seleccionada));
                                            setPosterZoom(!posterZoom);
                                        }}
                                        title={posterZoom ? "Clic para cerrar zoom" : "Clic para ampliar imagen"}
                                    >
                                        <img
                                            src={getPoster(seleccionada)}
                                            alt={getTitulo(seleccionada)}
                                            style={{
                                                width: posterZoom ? '250px' : '180px',
                                                height: posterZoom ? '360px' : '260px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                border: '2px solid #fff',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                        />

                                        {posterZoom && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                right: '8px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                color: '#000',
                                                border: '1px solid rgba(255, 255, 255, 0.9)',
                                                borderRadius: '4px',
                                                padding: '8px 10px',
                                                fontSize: '0.72rem',
                                                textAlign: 'left',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                zIndex: 10
                                            }} onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-between align-items-center mb-1 border-bottom pb-1">
                                                    <span className="fw-bold text-dark"><i className="fas fa-info-circle text-primary me-1"></i> Especificaciones</span>
                                                    <button 
                                                        type="button" 
                                                        className="btn-close" 
                                                        style={{ fontSize: '0.5rem' }} 
                                                        onClick={() => setPosterZoom(false)}
                                                        title="Cerrar"
                                                    ></button>
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
                                    <div className="row g-2 mb-3" style={{ fontSize: '0.88rem' }}>
                                        <div className="col-sm-6">
                                            <p className="mb-1 text-dark"><strong>ID de Sistema:</strong> <span className="text-muted">#{seleccionada.id}</span></p>
                                            <p className="mb-1 text-dark"><strong>Género:</strong> <span className="badge bg-secondary">{getGenero(seleccionada)}</span></p>
                                            <p className="mb-1 text-dark"><strong>Año de Estreno:</strong> {seleccionada.anio || 'N/A'}</p>
                                            <p className="mb-1 text-dark"><strong>Director:</strong> {seleccionada.director || 'No especificado'}</p>
                                        </div>
                                        <div className="col-sm-6">
                                            <p className="mb-1 text-dark"><strong>País de Origen:</strong> {seleccionada.pais || 'México'}</p>
                                            <p className="mb-1 text-dark"><strong>Duración:</strong> {seleccionada.duracion_min ? `${seleccionada.duracion_min} minutos` : 'No especificada'}</p>
                                            <p className="mb-1 text-dark"><strong>Estado Actual:</strong> <StatusBadge status={seleccionada.estado} /></p>
                                            <p className="mb-1 text-dark"><strong>Disponibilidad:</strong> <span className={`badge bg-${esActiva(seleccionada) ? 'success' : 'danger'}`}>{esActiva(seleccionada) ? 'Activa' : 'Archivada'}</span></p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
                                        <p className="mb-1 text-dark"><strong><i className="fas fa-users me-1 text-primary"></i> Reparto / Elenco:</strong></p>
                                        <p className="mb-0 text-muted">{seleccionada.elenco || 'No se registró elenco detallado.'}</p>
                                    </div>

                                    <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
                                        <p className="mb-1 text-dark"><strong><i className="fas fa-tv me-1 text-danger"></i> Plataformas de Streaming:</strong></p>
                                        <p className="mb-0 text-muted">
                                            {Array.isArray(seleccionada.plataformas_streaming) && seleccionada.plataformas_streaming.length > 0
                                                ? seleccionada.plataformas_streaming.join(', ')
                                                : (typeof seleccionada.plataformas_streaming === 'string' && seleccionada.plataformas_streaming ? seleccionada.plataformas_streaming : 'No disponible en plataformas digitales')}
                                        </p>
                                    </div>

                                    {seleccionada.trailer_url && (
                                        <p className="mb-2" style={{ fontSize: '0.85rem' }}>
                                            <strong><i className="fab fa-youtube me-1 text-danger"></i> Tráiler Oficial:</strong>{' '}
                                            <a href={seleccionada.trailer_url} target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-primary">
                                                {seleccionada.trailer_url}
                                            </a>
                                        </p>
                                    )}

                                    <hr className="my-3" />

                                    <div>
                                        <p className="text-dark fw-bold mb-1" style={{ fontSize: '0.88rem' }}><i className="fas fa-book-open me-1 text-secondary"></i> Sinopsis:</p>
                                        <p className="text-dark fst-italic mb-0" style={{ fontSize: '0.86rem', lineHeight: '1.5' }}>
                                            "{seleccionada.sinopsis || 'Sin descripción detallada registrada para esta película.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '4px' }}>
                        <div 
                            ref={tableRef} 
                            className="table-responsive" 
                            style={{ maxHeight: '420px', overflowY: 'auto', position: 'relative' }}
                        >
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top" style={{ zIndex: 2 }}>
                                    <tr>
                                        <th style={{ width: '60px' }}>ID</th>
                                        <th style={{ width: '70px' }} className="text-center">Póster</th>
                                        <th>Título</th>
                                        <th>Género</th>
                                        <th>Director</th>
                                        <th>Año</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '130px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {peliculasFiltradas.length > 0 ? (
                                        peliculasFiltradas.map((peli) => {
                                            const activa = esActiva(peli);
                                            return (
                                                <tr key={peli.id} style={{ opacity: activa ? 1 : 0.55, backgroundColor: activa ? 'transparent' : '#f8f9fa' }}>
                                                    <td className="fw-bold text-muted">#{peli.id}</td>
                                                    <td className="text-center">
                                                        <img
                                                            src={getPoster(peli)}
                                                            alt={getTitulo(peli)}
                                                            onClick={(e) => abrirModalPoster(peli, e)}
                                                            style={{
                                                                width: '38px',
                                                                height: '52px',
                                                                objectFit: 'cover',
                                                                borderRadius: '2px',
                                                                border: '1px solid #ced4da',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Clic para ampliar póster"
                                                            onError={(e) => { e.target.src = '/dist/assets/img/posters/default.jpg'; }}
                                                        />
                                                    </td>
                                                    <td className="fw-semibold text-dark">{getTitulo(peli)}</td>
                                                    <td>
                                                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.75rem' }}>{getGenero(peli)}</span>
                                                    </td>
                                                    <td>{peli.director || 'N/A'}</td>
                                                    <td>{peli.anio || 'N/A'}</td>
                                                    <td className="text-center">
                                                        <StatusBadge status={peli.estado || (activa ? 'publicada' : 'archivada')} />
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button className="btn btn-outline-secondary" onClick={() => handleVer(peli)} title="Ver Detalle Completo" style={{ padding: '2px 6px', borderRadius: '2px 0 0 2px' }}>
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button className="btn btn-outline-primary" onClick={() => handleEditar(peli)} title="Editar Película" style={{ padding: '2px 6px' }}>
                                                                <i className="fas fa-pen"></i>
                                                            </button>
                                                            <button
                                                                className={`btn ${activa ? 'btn-outline-danger' : 'btn-success'}`}
                                                                onClick={() => handleToggle(peli)}
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

                </div>
            </section>
        </AuthenticatedLayout>
    );
}