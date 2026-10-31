import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, router } from '@inertiajs/react';
import { PosterImg, MovieModal, RatingStars, FlashToast } from '@/Components/UserWidgets';

export default function Peliculas({ auth, favoritos = [], historial = [], misValoraciones = [] }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState('favoritos');
    const [peliculaAbierta, setPeliculaAbierta] = useState(null);

    const quitarFavorito = (peliculaId) => {
        router.post(route('user.favoritos.toggle', peliculaId), {}, { preserveScroll: true });
    };

    const quitarValoracion = (id) => {
        if (confirm('¿Eliminar esta valoración?')) {
            router.delete(route('user.valoraciones.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout auth={auth} title="Mis Películas">
            <FlashToast flash={flash} />

            <section style={{
                position: 'relative', minHeight: '160px', paddingTop: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.9) 90%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="font-heading text-white mb-0" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: 600 }}>Mis Películas</h1>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#000', minHeight: 'calc(100vh - 160px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    <div className="d-flex gap-2 mb-4">
                        {[['favoritos', 'Favoritos'], ['historial', 'Historial'], ['valoraciones', 'Mis Valoraciones']].map(([key, label]) => (
                            <button key={key} className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setTab(key)}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === 'favoritos' && (
                        favoritos.length > 0 ? (
                            <div className="row g-3">
                                {favoritos.map((p) => (
                                    <div key={p.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                        <div className="position-relative" style={{ cursor: 'pointer' }} onClick={() => setPeliculaAbierta(p)}>
                                            <div style={{ aspectRatio: '2/3', borderRadius: '6px', overflow: 'hidden' }}><PosterImg src={p.poster} titulo={p.titulo} /></div>
                                            <div className="text-white small fw-semibold text-truncate mt-2">{p.titulo}</div>
                                        </div>
                                        <button className="btn btn-sm btn-outline-danger w-100 mt-1" style={{ fontSize: '0.72rem' }} onClick={() => quitarFavorito(p.id)}>
                                            <i className="fas fa-heart-broken me-1"></i>Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-muted">Aún no tienes películas favoritas.</p>
                    )}

                    {tab === 'historial' && (
                        <div className="card border-0" style={{ backgroundColor: '#111' }}>
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead><tr><th>Película</th><th>Fecha de consulta</th></tr></thead>
                                    <tbody>
                                        {historial.length > 0 ? historial.map((h) => (
                                            <tr key={h.id}><td>{h.pelicula}</td><td className="text-muted">{h.fecha}</td></tr>
                                        )) : <tr><td colSpan="2" className="text-center text-muted py-4">Sin historial de visualización todavía.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {tab === 'valoraciones' && (
                        <div className="card border-0" style={{ backgroundColor: '#111' }}>
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead><tr><th>Película</th><th>Mi valoración</th><th>Fecha</th><th className="text-end">Acción</th></tr></thead>
                                    <tbody>
                                        {misValoraciones.length > 0 ? misValoraciones.map((v) => (
                                            <tr key={v.id}>
                                                <td>{v.pelicula}</td>
                                                <td><RatingStars value={v.puntuacion} /></td>
                                                <td className="text-muted">{v.fecha}</td>
                                                <td className="text-end">
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => quitarValoracion(v.id)}><i className="fas fa-trash-alt"></i></button>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="4" className="text-center text-muted py-4">Aún no has valorado ninguna película.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {peliculaAbierta && <MovieModal pelicula={peliculaAbierta} onClose={() => setPeliculaAbierta(null)} />}
        </AuthenticatedLayout>
    );
}