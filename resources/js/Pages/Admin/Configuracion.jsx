import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';

const COLORS = {
    darkBlue: '#1e293b',
    hoverBlue: '#0f172a',
    border: '#cbd5e1',
};

export default function Configuracion({ auth, configuraciones = {}, generosDb = '' }) {
    const { flash } = usePage().props;
    const [mostrarFlash, setMostrarFlash] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const timer = setTimeout(() => setMostrarFlash(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const perfilForm = useForm({
        nombre: auth?.user?.nombre || '',
        correo: auth?.user?.correo || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const sistemaForm = useForm({
        nombre_sistema: configuraciones?.nombre_sistema || 'CineReseñas',
        descripcion_welcome: configuraciones?.descripcion_welcome || 'Plataforma interactiva para la exploración, calificación y debate de películas y producciones cinematográficas de la comunidad.',
    });

    const handleGuardarPerfil = (e) => {
        e.preventDefault();
        perfilForm.put(route('admin.perfil.update', auth.user.id), {
            preserveScroll: true,
            onSuccess: () => {
                perfilForm.reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    const handleGuardarSistema = (e) => {
        e.preventDefault();
        sistemaForm.post(route('admin.configuracion.guardar'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Configuración">
            <style>{`
                nav.navbar, .navbar {
                    background-color: transparent !important;
                    position: absolute !important;
                    top: 0; left: 0; right: 0;
                    z-index: 1030;
                }
                .btn-custom-blue {
                    background-color: ${COLORS.darkBlue};
                    color: #ffffff;
                    border: 1px solid ${COLORS.darkBlue};
                    font-size: 0.75rem;
                    padding: 0.3rem 0.7rem;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .btn-custom-blue:hover {
                    background-color: ${COLORS.hoverBlue};
                    color: #ffffff;
                }
            `}</style>

            {mostrarFlash && (flash?.message || flash?.error) && (
                <div 
                    className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.8rem', borderRadius: '4px', maxWidth: '340px' }}
                >
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setMostrarFlash(false)}></button>
                </div>
            )}

            <section
                style={{
                    position: 'relative',
                    minHeight: '200px',
                    paddingTop: '75px',
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
                        Configuración
                    </h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85, maxWidth: '800px' }}>
                        Perfil de usuario, parámetros generales del sistema y visualización de géneros.
                    </p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container-fluid px-4 px-lg-5">
                    <div className="row gx-4 gy-4">

                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <h6 className="font-heading text-uppercase text-secondary mb-3" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em' }}>
                                    <i className="fas fa-user-circle me-2" style={{ color: COLORS.darkBlue }}></i>Perfil de Usuario
                                </h6>
                                <form onSubmit={handleGuardarPerfil}>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Nombre</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            value={perfilForm.data.nombre} 
                                            onChange={(e) => perfilForm.setData('nombre', e.target.value)}
                                            autoComplete="name"
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        />
                                        {perfilForm.errors.nombre && <div className="text-danger small mt-1">{perfilForm.errors.nombre}</div>}
                                    </div>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Correo electrónico</label>
                                        <input 
                                            type="email" 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            value={perfilForm.data.correo} 
                                            onChange={(e) => perfilForm.setData('correo', e.target.value)}
                                            autoComplete="email"
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        />
                                        {perfilForm.errors.correo && <div className="text-danger small mt-1">{perfilForm.errors.correo}</div>}
                                    </div>
                                    <hr className="my-3 text-muted" />
                                    <div className="mb-2" style={{ fontSize: '0.85rem' }}>
                                        <span className="text-muted fw-semibold">Cambio de Contraseña (Opcional)</span>
                                    </div>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Contraseña actual</label>
                                        <input 
                                            type="password" 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            placeholder="Ingresa tu contraseña actual" 
                                            value={perfilForm.data.current_password}
                                            onChange={(e) => perfilForm.setData('current_password', e.target.value)}
                                            autoComplete="current-password"
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        />
                                        {perfilForm.errors.current_password && <div className="text-danger small mt-1">{perfilForm.errors.current_password}</div>}
                                    </div>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Nueva contraseña</label>
                                        <input 
                                            type="password" 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            placeholder="Mínimo 8 caracteres (déjalo vacío si no deseas cambiarla)" 
                                            value={perfilForm.data.password}
                                            onChange={(e) => perfilForm.setData('password', e.target.value)}
                                            autoComplete="new-password"
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        />
                                        {perfilForm.errors.password && <div className="text-danger small mt-1">{perfilForm.errors.password}</div>}
                                    </div>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Confirmar nueva contraseña</label>
                                        <input 
                                            type="password" 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            placeholder="Repite la nueva contraseña" 
                                            value={perfilForm.data.password_confirmation}
                                            onChange={(e) => perfilForm.setData('password_confirmation', e.target.value)}
                                            autoComplete="new-password"
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-custom-blue" disabled={perfilForm.processing}>
                                        <i className="fas fa-save me-1"></i> {perfilForm.processing ? 'Guardando...' : 'Guardar cambios de perfil'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <h6 className="font-heading text-uppercase text-secondary mb-3" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em' }}>
                                    <i className="fas fa-sliders-h me-2" style={{ color: COLORS.darkBlue }}></i>Sistema y Vista Welcome
                                </h6>
                                <form onSubmit={handleGuardarSistema}>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Nombre de la plataforma</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            value={sistemaForm.data.nombre_sistema}
                                            onChange={(e) => sistemaForm.setData('nombre_sistema', e.target.value)}
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        />
                                        {sistemaForm.errors.nombre_sistema && <div className="text-danger small mt-1">{sistemaForm.errors.nombre_sistema}</div>}
                                    </div>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Descripción del sistema (Vista Welcome)</label>
                                        <textarea 
                                            className="form-control bg-white text-dark border shadow-sm" 
                                            rows={2} 
                                            value={sistemaForm.data.descripcion_welcome}
                                            onChange={(e) => sistemaForm.setData('descripcion_welcome', e.target.value)}
                                            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
                                        ></textarea>
                                        {sistemaForm.errors.descripcion_welcome && <div className="text-danger small mt-1">{sistemaForm.errors.descripcion_welcome}</div>}
                                    </div>
                                    <div className="mb-3" style={{ fontSize: '0.88rem' }}>
                                        <label className="form-label text-dark fw-semibold">Géneros disponibles (Lectura desde Base de Datos)</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-light text-muted border" 
                                            value={generosDb || 'No hay géneros registrados en la base de datos'}
                                            readOnly
                                            style={{ fontSize: '0.85rem', borderRadius: '4px', cursor: 'not-allowed' }}
                                        />
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>* Los géneros se gestionan desde el módulo de Películas y Reseñas.</small>
                                    </div>
                                    <button type="submit" className="btn-custom-blue mt-2" disabled={sistemaForm.processing}>
                                        <i className="fas fa-save me-1"></i> {sistemaForm.processing ? 'Guardando...' : 'Guardar configuración general'}
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}

