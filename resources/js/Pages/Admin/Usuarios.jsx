import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';

export default function Usuarios({ auth, usuarios = [] }) {
    const { flash } = usePage().props;
    const listaUsuarios = Array.isArray(usuarios) ? usuarios : (usuarios?.data ?? []);

    const [busqueda, setBusqueda] = useState('');
    const [columnaFiltro, setColumnaFiltro] = useState('todos');
    const [valorSelectFiltro, setValorSelectFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');

    const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla', 'detalle', 'crear', 'editar'
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const formCrear = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        rol: 'usuario',
    });

    const formEditar = useForm({
        rol: 'usuario',
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

    const esUsuarioActivo = (u) => {
        const estado = (u.estado || 'activo').toLowerCase();
        return estado === 'activo';
    };

    const handleToggleEstado = (usuario) => {
        const activo = esUsuarioActivo(usuario);
        const accion = activo ? 'desactivar a este usuario' : 'activar a este usuario';

        if (confirm(`¿Deseas ${accion}?`)) {
            router.patch(route('admin.usuarios.toggleStatus', usuario.id), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    router.reload({ only: ['usuarios'] });
                }
            });
        }
    };

    const handleVerDetalle = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setVistaActiva('detalle');
    };

    const handleAbrirCrear = () => {
        formCrear.reset();
        setVistaActiva('crear');
    };

    const handleAbrirEditar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        formEditar.setData({
            rol: usuario.rol || usuario.tipo || 'usuario',
        });
        setVistaActiva('editar');
    };

    const handleEnviarCrear = (e) => {
        e.preventDefault();
        formCrear.post(route('admin.usuarios.store'), {
            onSuccess: () => {
                formCrear.reset();
                setVistaActiva('tabla');
            },
        });
    };

    const handleEnviarEditar = (e) => {
        e.preventDefault();
        if (!usuarioSeleccionado) return;
        
        formEditar.put(route('admin.usuarios.update', usuarioSeleccionado.id), {
            preserveScroll: true,
            onSuccess: () => {
                setVistaActiva('tabla');
                formEditar.reset();
            },
            onError: () => {
                formEditar.clearErrors();
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

    const getIdUsuario = (u) => String(u.id || '');
    const getNombre = (u) => u.nombre || 'Sin nombre';
    const getEmail = (u) => u.correo || 'Sin correo';
    const getRol = (u) => u.rol || u.tipo || 'usuario';
    const getEstado = (u) => u.estado || 'activo';
    
    const getFecha = (u) => {
        const fechaCruda = u.creado || u.created_at;
        if (!fechaCruda) return 'N/A';
        const partes = String(fechaCruda).split('T')[0].split(' ')[0].split('-');
        if (partes.length === 3) {
            const anio = partes[0];
            const mes = parseInt(partes[1], 10);
            const dia = parseInt(partes[2], 10);
            return `${dia}/${mes}/${anio}`;
        }
        return 'N/A';
    };

    const usuariosFiltrados = listaUsuarios.filter((u) => {
        const idUsr = getIdUsuario(u);
        const nombre = getNombre(u);
        const email = getEmail(u);
        const rol = getRol(u);
        const estado = getEstado(u);
        const fecha = getFecha(u);

        if (columnaFiltro === 'estado') {
            if (!valorSelectFiltro) return true;
            return estado.toLowerCase() === valorSelectFiltro.toLowerCase();
        }

        if (columnaFiltro === 'rol') {
            if (!valorSelectFiltro) return true;
            return rol.toLowerCase() === valorSelectFiltro.toLowerCase();
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
            case 'nombre':
                return nombre.toLowerCase().includes(val);
            case 'email':
                return email.toLowerCase().includes(val);
            default:
                return (
                    idUsr.includes(val) ||
                    nombre.toLowerCase().includes(val) ||
                    email.toLowerCase().includes(val) ||
                    rol.toLowerCase().includes(val) ||
                    estado.toLowerCase().includes(val) ||
                    fecha.toLowerCase().includes(val)
                );
        }
    });

    return (
        <AuthenticatedLayout auth={auth} title="Gestión de Usuarios">

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
                        Gestión de Usuarios
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Apartado para consultar, administrar, filtrar y controlar el acceso de los usuarios registrados.
                    </p>
                </div>
            </section>

            {/* SECCIÓN PRINCIPAL */}
            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    {/* VISTA DETALLE */}
                    {vistaActiva === 'detalle' && usuarioSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #6c757d' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-user me-2 text-secondary"></i>Detalle del Usuario #{usuarioSeleccionado.id}
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
                                    <p className="mb-1 text-dark"><strong>ID:</strong> #{usuarioSeleccionado.id}</p>
                                    <p className="mb-1 text-dark"><strong>Nombre:</strong> {getNombre(usuarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Correo electrónico:</strong> {getEmail(usuarioSeleccionado)}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-dark"><strong>Rol:</strong> <span className="badge bg-secondary">{getRol(usuarioSeleccionado)}</span></p>
                                    <p className="mb-1 text-dark"><strong>Fecha de registro:</strong> {getFecha(usuarioSeleccionado)}</p>
                                    <p className="mb-1 text-dark"><strong>Estado:</strong> <span className={`badge ${esUsuarioActivo(usuarioSeleccionado) ? 'bg-success' : 'bg-danger'}`}>{getEstado(usuarioSeleccionado)}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA CREAR NUEVO USUARIO */}
                    {vistaActiva === 'crear' && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #198754' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-success" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-user-plus me-2"></i>Registrar Nuevo Usuario
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
                            <form onSubmit={handleEnviarCrear}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Nombre Completo</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={formCrear.data.name}
                                            onChange={(e) => formCrear.setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-sm"
                                            value={formCrear.data.email}
                                            onChange={(e) => formCrear.setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Rol / Tipo de Usuario</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={formCrear.data.rol}
                                            onChange={(e) => formCrear.setData('rol', e.target.value)}
                                            required
                                        >
                                            <option value="usuario">usuario</option>
                                            <option value="editor">editor</option>
                                            <option value="administrador">administrador</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-sm"
                                            value={formCrear.data.password}
                                            onChange={(e) => formCrear.setData('password', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-sm"
                                            value={formCrear.data.password_confirmation}
                                            onChange={(e) => formCrear.setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-success btn-sm px-4"
                                            style={{ borderRadius: '2px' }}
                                            disabled={formCrear.processing}
                                        >
                                            {formCrear.processing ? 'Registrando...' : 'Guardar Nuevo Usuario'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* VISTA EDITAR ÚNICAMENTE ROL DE USUARIO */}
                    {vistaActiva === 'editar' && usuarioSeleccionado && (
                        <div className="card border-0 shadow-sm bg-white p-4 mb-3" style={{ borderRadius: '2px', borderLeft: '4px solid #ffc107' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    <i className="fas fa-user-edit me-2 text-warning"></i>Modificar Rol de Usuario: {getNombre(usuarioSeleccionado)}
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
                            <form onSubmit={handleEnviarEditar}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}><strong>Correo (No modificable):</strong> {getEmail(usuarioSeleccionado)}</p>
                                        <p className="mb-3 text-muted" style={{ fontSize: '0.85rem' }}><strong>Nombre (No modificable):</strong> {getNombre(usuarioSeleccionado)}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Seleccionar Nuevo Rol / Tipo</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={formEditar.data.rol}
                                            onChange={(e) => formEditar.setData('rol', e.target.value)}
                                            required
                                        >
                                            <option value="usuario">usuario</option>
                                            <option value="editor">editor</option>
                                            <option value="administrador">administrador</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12 d-flex justify-content-end mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-warning btn-sm px-4 text-dark fw-semibold"
                                            style={{ borderRadius: '2px' }}
                                            disabled={formEditar.processing}
                                        >
                                            {formEditar.processing ? 'Actualizando...' : 'Guardar Cambios de Rol'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* FILTROS Y BOTÓN DE NUEVO USUARIO AL LADO DERECHO */}
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
                                <option value="nombre">Nombre</option>
                                <option value="email">Correo</option>
                                <option value="rol">Rol</option>
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
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            ) : columnaFiltro === 'rol' ? (
                                <select
                                    className="form-select form-select-sm bg-white text-dark border"
                                    style={{ maxWidth: '190px', fontSize: '0.8rem' }}
                                    value={valorSelectFiltro}
                                    onChange={(e) => setValorSelectFiltro(e.target.value)}
                                >
                                    <option value="">Todos los roles</option>
                                    <option value="administrador">administrador</option>
                                    <option value="editor">editor</option>
                                    <option value="usuario">usuario</option>
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
                                        placeholder={columnaFiltro === 'todos' ? 'Buscar usuarios...' : `Buscar por ${columnaFiltro}...`}
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

                            {/* BOTÓN NUEVO USUARIO AL LADO DE LOS FILTROS */}
                            {vistaActiva === 'tabla' && (
                                <button
                                    type="button"
                                    className="btn btn-outline-dark btn-sm ms-2 px-3 py-1 bg-white text-dark shadow-sm"
                                    onClick={handleAbrirCrear}
                                    style={{ borderRadius: '2px', fontSize: '0.8rem', height: '31px' }}
                                >
                                    <i className="fas fa-user-plus me-1 text-success"></i> Nuevo Usuario
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

                    {/* TABLA DE USUARIOS */}
                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '2px' }}>
                        <div
                            ref={tableContainerRef}
                            className="table-responsive"
                            style={{ maxHeight: '600px', overflowY: 'auto' }}
                        >
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top" style={{ zIndex: 5 }}>
                                    <tr>
                                        <th style={{ width: '80px' }}>ID</th>
                                        <th>Nombre</th>
                                        <th>Correo Electrónico</th>
                                        <th>Rol</th>
                                        <th>Fecha Registro</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-center" style={{ width: '160px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.length > 0 ? (
                                        usuariosFiltrados.map((usuario) => {
                                            const activo = esUsuarioActivo(usuario);

                                            return (
                                                <tr
                                                    key={usuario.id}
                                                    style={{
                                                        opacity: activo ? 1 : 0.55,
                                                        backgroundColor: activo ? 'transparent' : '#f8f9fa'
                                                    }}
                                                >
                                                    <td className="fw-bold text-muted">#{usuario.id}</td>
                                                    <td className="fw-semibold text-dark">{getNombre(usuario)}</td>
                                                    <td className="text-muted">{getEmail(usuario)}</td>
                                                    <td>
                                                        <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                                            {getRol(usuario)}
                                                        </span>
                                                    </td>
                                                    <td>{getFecha(usuario)}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${activo ? 'bg-success' : 'bg-danger'}`}>
                                                            {getEstado(usuario)}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            {/* Ver Detalle */}
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => handleVerDetalle(usuario)}
                                                                title="Ver detalle del usuario"
                                                                style={{ padding: '2px 6px', borderRadius: '2px 0 0 0' }}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>

                                                            {/* Editar Rol */}
                                                            <button
                                                                className="btn btn-outline-warning text-dark"
                                                                onClick={() => handleAbrirEditar(usuario)}
                                                                title="Editar tipo de usuario / rol"
                                                                style={{ padding: '2px 6px' }}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>

                                                            {/* Activar / Desactivar */}
                                                            <button
                                                                className={`btn ${activo ? 'btn-outline-danger' : 'btn-success'}`}
                                                                onClick={() => handleToggleEstado(usuario)}
                                                                title={activo ? 'Desactivar usuario' : 'Activar usuario'}
                                                                style={{ padding: '2px 6px', borderRadius: '0 2px 2px 0' }}
                                                            >
                                                                <i className={`fas ${activo ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                <i className="fas fa-users fa-2x mb-2 d-block opacity-50"></i>
                                                No se encontraron usuarios registrados con los criterios especificados.
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