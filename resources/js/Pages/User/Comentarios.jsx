import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import { FlashToast } from '@/Components/UserWidgets';

export default function Comentarios({ auth, comentarios = [], peliculas = [] }) {
    const { flash } = usePage().props;
    const [editandoId, setEditandoId] = useState(null);
    const [textoEdit, setTextoEdit] = useState('');

    const form = useForm({ pelicula_id: '', texto: '' });

    const handleNuevo = (e) => {
        e.preventDefault();
        form.post(route('user.comentarios.store'), { onSuccess: () => form.reset() });
    };

    const iniciarEdicion = (c) => { setEditandoId(c.id); setTextoEdit(c.texto); };

    const guardarEdicion = (id) => {
        router.put(route('user.comentarios.update', id), { texto: textoEdit }, { onSuccess: () => setEditandoId(null) });
    };

    const eliminar = (id) => {
        if (confirm('¿Eliminar este comentario?')) router.delete(route('user.comentarios.destroy', id));
    };

    return (
        <AuthenticatedLayout auth={auth} title="Mis Comentarios">
            <FlashToast flash={flash} />

            <section style={{
                position: 'relative', minHeight: '160px', paddingTop: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.9) 90%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: 600 }}>Mis Comentarios</h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85 }}>Comparte tus ideas sobre las películas y gestiona tus comentarios.</p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 160px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    <div className="card border-0 shadow-sm p-3 mb-4">
                        <h6 className="fw-bold text-muted mb-2" style={{ fontSize: '0.85rem' }}>Comparte tus ideas</h6>
                        <form onSubmit={handleNuevo} className="d-flex gap-2 flex-wrap">
                            <select className="form-select form-select-sm" style={{ maxWidth: '240px' }} value={form.data.pelicula_id} onChange={(e) => form.setData('pelicula_id', e.target.value)} required>
                                <option value="">Selecciona una película...</option>
                                {peliculas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                            </select>
                            <input type="text" className="form-control form-control-sm flex-grow-1" placeholder="Escribe tu comentario..." value={form.data.texto} onChange={(e) => form.setData('texto', e.target.value)} required />
                            <button type="submit" className="btn btn-sm btn-primary" disabled={form.processing}><i className="fas fa-paper-plane"></i></button>
                        </form>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light"><tr><th>Película</th><th>Comentario</th><th>Fecha</th><th className="text-center">Estado</th><th className="text-end">Acción</th></tr></thead>
                                <tbody>
                                    {comentarios.length > 0 ? comentarios.map((c) => (
                                        <tr key={c.id}>
                                            <td className="text-dark fw-semibold">{c.pelicula}</td>
                                            <td>
                                                {editandoId === c.id ? (
                                                    <input type="text" className="form-control form-control-sm" value={textoEdit} onChange={(e) => setTextoEdit(e.target.value)} />
                                                ) : (
                                                    <span className="text-dark">{c.texto}</span>
                                                )}
                                            </td>
                                            <td className="text-muted">{c.fecha}</td>
                                            <td className="text-center"><span className={`badge ${c.estado === 'visible' ? 'bg-success' : 'bg-secondary'}`}>{c.estado}</span></td>
                                            <td className="text-end">
                                                {editandoId === c.id ? (
                                                    <>
                                                        <button className="btn btn-sm btn-success me-1" onClick={() => guardarEdicion(c.id)}><i className="fas fa-check"></i></button>
                                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditandoId(null)}><i className="fas fa-times"></i></button>
                                                    </>
                                                ) : (
                                                    <div className="btn-group btn-group-sm">
                                                        <button className="btn btn-outline-primary" onClick={() => iniciarEdicion(c)}><i className="fas fa-pen"></i></button>
                                                        <button className="btn btn-outline-danger" onClick={() => eliminar(c.id)}><i className="fas fa-trash-alt"></i></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="text-center text-muted py-4">Aún no has comentado ninguna película.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}