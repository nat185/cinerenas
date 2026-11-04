import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';

const COLORS = {
    accent: '#0d9488', dark: '#334155', muted: '#94a3b8', border: '#cbd5e1',
    bg: '#f8f9fa', bgLight: '#f1f5f9', purple: '#6f42c1'
};

// Botón de ojo para ver / ocultar contraseña (solo el icono, sin contorno)
function OjoContrasena({ visible, onToggle, color = '#64748b', hover = '#0f172a', size = 20, offsetTop = 0 }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            className="position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center justify-content-center border-0 bg-transparent p-0"
            style={{ width: '28px', height: '28px', marginTop: offsetTop, color, cursor: 'pointer', outline: 'none', boxShadow: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = color; }}
            title={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
            aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
        >
            {visible ? (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )}
        </button>
    );
}

export default function EditorPerfil({ auth }) {
    const { flash } = usePage().props;
    const [mostrarFlash, setMostrarFlash] = useState(false);
    
    // Estados para ver/ocultar cada contraseña
    const [verActual, setVerActual] = useState(false);
    const [verNueva, setVerNueva] = useState(false);
    const [verConfirmar, setVerConfirmar] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setMostrarFlash(true);
            const t = setTimeout(() => setMostrarFlash(false), 3000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const form = useForm({
        name: auth?.user?.nombre || '',
        email: auth?.user?.correo || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleGuardar = (e) => {
        e.preventDefault();
        form.put('/editor/perfil', {
            preserveScroll: true,
            onSuccess: () => form.reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Mi Perfil">
            {mostrarFlash && (flash?.message || flash?.error) && (
                <div className={`alert ${flash?.error ? 'alert-danger' : 'alert-success'} shadow py-2 px-3 mb-0 d-flex align-items-center`}
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontSize: '0.8rem', borderRadius: '4px', maxWidth: '320px' }}>
                    <i className={`fas ${flash?.error ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
                    <div className="flex-grow-1">{flash?.message || flash?.error}</div>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.6rem' }} onClick={() => setMostrarFlash(false)}></button>
                </div>
            )}

            <section style={{
                position: 'relative', minHeight: '100px', paddingTop: '10px', paddingBottom: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)', zIndex: 1 }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
                    <h1 className="font-heading text-white mb-0" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', fontWeight: '600' }}>Mi Perfil</h1>
                </div>
            </section>

            <section className="py-2" style={{ backgroundColor: COLORS.bg, minHeight: 'calc(100vh - 120px)' }}>
                <div className="container-fluid px-4 px-lg-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '4px' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <h6 className="font-heading text-uppercase text-muted mb-0" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                        <i className="fas fa-user-circle me-2"></i> Perfil de Usuario
                                    </h6>
                                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.6rem' }}>{auth?.user?.rol}</span>
                                </div>

                                <form onSubmit={handleGuardar}>
                                    <div className="mb-2">
                                        <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>Nombre</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm" 
                                            value={form.data.name} 
                                            onChange={(e) => form.setData('name', e.target.value)} 
                                            style={{ fontSize: '0.82rem' }} 
                                        />
                                        {form.errors.name && <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>{form.errors.name}</div>}
                                    </div>

                                    <div className="mb-2">
                                        <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>Correo electrónico</label>
                                        <input 
                                            type="email" 
                                            className="form-control form-control-sm" 
                                            value={form.data.email} 
                                            onChange={(e) => form.setData('email', e.target.value)} 
                                            style={{ fontSize: '0.82rem' }} 
                                        />
                                        {form.errors.email && <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>{form.errors.email}</div>}
                                    </div>

                                    <hr className="my-2" />

                                    <p className="text-muted small fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.03em' }}>CAMBIO DE CONTRASEÑA (OPCIONAL)</p>

                                    {/* Contraseña Actual */}
                                    <div className="mb-2">
                                        <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>Contraseña actual</label>
                                        <div className="position-relative">
                                            <input 
                                                type={verActual ? "text" : "password"} 
                                                className="form-control form-control-sm pe-5" 
                                                placeholder="Ingresa tu contraseña actual"
                                                value={form.data.current_password} 
                                                onChange={(e) => form.setData('current_password', e.target.value)} 
                                                style={{ fontSize: '0.82rem' }} 
                                            />
                                            <OjoContrasena visible={verActual} onToggle={() => setVerActual(!verActual)} hover={COLORS.accent} size={18} />
                                        </div>
                                        {form.errors.current_password && <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>{form.errors.current_password}</div>}
                                    </div>

                                    {/* Nueva Contraseña */}
                                    <div className="mb-2">
                                        <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>Nueva contraseña</label>
                                        <div className="position-relative">
                                            <input 
                                                type={verNueva ? "text" : "password"} 
                                                className="form-control form-control-sm pe-5" 
                                                placeholder="Mínimo 8 caracteres (déjalo vacío si no deseas cambiarla)"
                                                value={form.data.password} 
                                                onChange={(e) => form.setData('password', e.target.value)} 
                                                style={{ fontSize: '0.82rem' }} 
                                            />
                                            <OjoContrasena visible={verNueva} onToggle={() => setVerNueva(!verNueva)} hover={COLORS.accent} size={18} />
                                        </div>
                                        {form.errors.password && <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>{form.errors.password}</div>}
                                    </div>

                                    {/* Confirmar Nueva Contraseña */}
                                    <div className="mb-3">
                                        <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>Confirmar nueva contraseña</label>
                                        <div className="position-relative">
                                            <input 
                                                type={verConfirmar ? "text" : "password"} 
                                                className="form-control form-control-sm pe-5" 
                                                placeholder="Repite la nueva contraseña"
                                                value={form.data.password_confirmation} 
                                                onChange={(e) => form.setData('password_confirmation', e.target.value)} 
                                                style={{ fontSize: '0.82rem' }} 
                                            />
                                            <OjoContrasena visible={verConfirmar} onToggle={() => setVerConfirmar(!verConfirmar)} hover={COLORS.accent} size={18} />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-sm px-4 py-2 text-white fw-semibold" 
                                        disabled={form.processing}
                                        style={{ backgroundColor: '#1e293b', fontSize: '0.82rem', borderRadius: '4px' }}
                                    >
                                        <i className="fas fa-save me-2"></i> {form.processing ? 'Guardando...' : 'Guardar cambios de perfil'}
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