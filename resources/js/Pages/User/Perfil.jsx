import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import { FlashToast } from '@/Components/UserWidgets';

export default function Perfil({ auth }) {
    const { flash } = usePage().props;

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
            <FlashToast flash={flash} />

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
                                        <input type="password" className="form-control" value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} style={{ fontSize: '0.85rem' }} />
                                        {form.errors.current_password && <div className="text-danger small mt-1">{form.errors.current_password}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Nueva contraseña</label>
                                        <input type="password" className="form-control" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} style={{ fontSize: '0.85rem' }} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Confirmar nueva contraseña</label>
                                        <input type="password" className="form-control" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} style={{ fontSize: '0.85rem' }} />
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