import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, router } from '@inertiajs/react';
import { PosterImg, FlashToast } from '@/Components/UserWidgets';

export default function Resenas({ auth, resenas = [], filtros = {} }) {
    const { flash } = usePage().props;
    const [pelicula, setPelicula] = useState(filtros.pelicula || '');
    const [autor, setAutor] = useState(filtros.autor || '');
    const [soloGuardadas, setSoloGuardadas] = useState(!!filtros.solo_guardadas);
    const [expandida, setExpandida] = useState(null);

    const buscar = (e) => {
        e?.preventDefault();
        router.get(route('user.resenas'), { pelicula, autor, solo_guardadas: soloGuardadas ? 1 : 0 }, { preserveState: true });
    };

    const toggleGuardar = (id) => {
        router.post(route('user.resenas.guardar', id), {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Reseñas">
            <FlashToast flash={flash} />

            <section style={{
                position: 'relative', minHeight: '160px', paddingTop: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center',
                backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 45%'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.9) 90%)' }}></div>
                <div className="container-fluid px-4 px-lg-5" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="font-heading text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: 600 }}>Reseñas</h1>
                    <p className="text-light mb-0" style={{ fontSize: '0.9rem', opacity: 0.85 }}>Explora las reseñas publicadas por nuestros editores y guarda las que quieras volver a leer.</p>
                </div>
            </section>

            <section className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 160px)' }}>
                <div className="container-fluid px-4 px-lg-5">

                    <form onSubmit={buscar} className="d-flex flex-wrap gap-2 mb-4 align-items-center">
                        <input type="text" className="form-control form-control-sm" placeholder="Buscar por película..." style={{ maxWidth: '220px', fontSize: '0.8rem' }} value={pelicula} onChange={(e) => setPelicula(e.target.value)} />
                        <input type="text" className="form-control form-control-sm" placeholder="Buscar por autor..." style={{ maxWidth: '220px', fontSize: '0.8rem' }} value={autor} onChange={(e) => setAutor(e.target.value)} />
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="soloGuardadas" checked={soloGuardadas} onChange={(e) => setSoloGuardadas(e.target.checked)} />
                            <label className="form-check-label small" htmlFor="soloGuardadas">Solo guardadas</label>
                        </div>
                        <button type="submit" className="btn btn-sm btn-primary"><i className="fas fa-search me-1"></i>Buscar</button>
                    </form>

                    <div className="row g-3">
                        {resenas.length > 0 ? resenas.map((r) => (
                            <div key={r.id} className="col-12">
                                <div className="card border-0 shadow-sm p-3 d-flex flex-row gap-3 align-items-start">
                                    <div style={{ width: '60px', height: '85px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                        <PosterImg src={r.pelicula_poster} titulo={r.pelicula} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">{r.titulo}</h6>
                                                <span className="text-muted small">{r.pelicula} · por {r.autor} · {r.fecha}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="text-warning">★ {r.calificacion}</span>
                                                <button className={`btn btn-sm ${r.guardada ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleGuardar(r.id)} title={r.guardada ? 'Quitar de guardadas' : 'Guardar'}>
                                                    <i className="fas fa-bookmark"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-dark small mt-2 mb-0" style={{ maxHeight: expandida === r.id ? 'none' : '2.6em', overflow: 'hidden' }}>
                                            {r.contenido}
                                        </p>
                                        <button className="btn btn-link btn-sm p-0" style={{ fontSize: '0.75rem' }} onClick={() => setExpandida(expandida === r.id ? null : r.id)}>
                                            {expandida === r.id ? 'Ver menos' : 'Ver más'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-muted">No se encontraron reseñas con esos criterios.</p>}
                    </div>

                </div>
            </section>
        </AuthenticatedLayout>
    );
}