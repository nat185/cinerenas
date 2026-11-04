import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';

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

// Campo de contraseña con ojo para ver / ocultar
function CampoContrasena({ value, onChange }) {
    const [ver, setVer] = useState(false);
    return (
        <div className="position-relative">
            <input type={ver ? 'text' : 'password'} className="form-control pe-5" value={value} onChange={onChange} style={{ fontSize: '0.85rem' }} />
            <OjoContrasena visible={ver} onToggle={() => setVer(!ver)} hover="#0d9488" size={19} />
        </div>
    );
}

export default function Perfil({ auth }) {
    const { flash } = usePage().props;
    const [flashVisible, setFlashVisible] = useState(false);

    useEffect(() => {
        if (flash?.message) {
            setFlashVisible(true);
            const timer = setTimeout(() => setFlashVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const form = useForm({
        name: auth?.user?.nombre || '',
        email: auth?.user?.correo || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const guardar = (e) => {
        e.preventDefault();
        form.put(route('user.perfil.update'), {
            preserveScroll: true,
            onSuccess: () => form.reset('current_password', 'password', 'password_confirmation'),
        });
    };

    const cerrarSesion = () => router.post(route('logout'));

    return (
        <AuthenticatedLayout auth={auth} title="Mi Perfil">
            {flashVisible && flash?.message && (
                <div 
                    className="alert alert-dark text-white border-secondary shadow-lg fade show" 
                    role="alert" 
                    style={{
                        position: 'fixed', bottom: '20px', left: '20px', zIndex: 99999,
                        fontSize: '0.85rem', backgroundColor: 'rgba(20, 20, 20, 0.95)',
                        backdropFilter: 'blur(5px)', borderRadius: '6px', padding: '10px 18px',
                        borderLeft: '4px solid #0d9488', boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                    }}
                >
                    <i className="fas fa-info-circle me-2 text-info"></i>
                    {flash.message}
                </div>
            )}

            <section style={{
                position: 'relative', minHeight: '160px', paddingTop: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.9) 90%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="font-heading text-white mb-0" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: 600 }}>Mi Perfil</h1>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 160px)' }}>
                <div className="container-fluid px-4 px-lg-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm p-4">
                                <div className="text-center mb-4">
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <i className="fas fa-user text-white" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <h6 className="fw-bold text-dark mt-2 mb-0">{auth?.user?.nombre}</h6>
                                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>{auth?.user?.rol}</span>
                                </div>

                                <form onSubmit={guardar}>
                                    <div className="mb-3">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Nombre de usuario</label>
                                        <input type="text" className="form-control" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} style={{ fontSize: '0.85rem' }} />
                                        {form.errors.name && <div className="text-danger small mt-1">{form.errors.name}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Correo</label>
                                        <input type="email" className="form-control" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} style={{ fontSize: '0.85rem' }} />
                                        {form.errors.email && <div className="text-danger small mt-1">{form.errors.email}</div>}
                                    </div>
                                    <hr className="my-3" />
                                    <div className="mb-3">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Contraseña actual (solo si vas a cambiarla)</label>
                                        <CampoContrasena value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} />
                                        {form.errors.current_password && <div className="text-danger small mt-1">{form.errors.current_password}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Nueva contraseña</label>
                                        <CampoContrasena value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Confirmar nueva contraseña</label>
                                        <CampoContrasena value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary btn-sm px-4" disabled={form.processing}>
                                            {form.processing ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                        <button type="button" className="btn btn-outline-danger btn-sm px-4" onClick={cerrarSesion}>
                                            <i className="fas fa-sign-out-alt me-1"></i> Cerrar sesión
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}