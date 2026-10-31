import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, router, Link } from '@inertiajs/react';
import { MovieRow, MovieModal, FlashToast } from '@/Components/UserWidgets';

export default function Inicio({ auth, mejorValoradas = [], nuevas = [], recomendadas = [], generos = [] }) {
    const { flash } = usePage().props;
    const [peliculaAbierta, setPeliculaAbierta] = useState(null);

    const abrir = (p) => {
        setPeliculaAbierta(p);
        router.post(route('user.historial.store'), { pelicula_id: p.id }, { preserveScroll: true, preserveState: true, only: [] });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Inicio">
            <FlashToast flash={flash} />

            <style>{`
                @keyframes tituloEntrada {
                    0% { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                @keyframes brilloSutil {
                    0%, 100% { text-shadow: 0 0 18px rgba(92, 141, 137, 0.35); }
                    50% { text-shadow: 0 0 28px rgba(92, 141, 137, 0.6); }
                }
                @keyframes pulsoGenero {
                    0%, 100% { background-color: rgba(92, 141, 137, 0.18); }
                    50% { background-color: rgba(92, 141, 137, 0.35); }
                }
                .titulo-cine {
                    font-family: 'Lora', 'Georgia', serif;
                    font-style: italic;
                    font-weight: 800;
                    animation: tituloEntrada 0.9s cubic-bezier(0.22, 1, 0.36, 1) both,
                               brilloSutil 4s ease-in-out infinite 0.9s;
                }
                .badge-genero-home {
                    animation: pulsoGenero 5s ease-in-out infinite;
                    border: 1px solid rgba(255,255,255,0.15);
                    transition: transform 0.25s ease;
                }
                .badge-genero-home:hover {
                    transform: translateY(-2px) scale(1.06);
                }
            `}</style>

            <section
                style={{
                    position: 'relative', minHeight: '380px', paddingTop: '70px', overflow: 'hidden',
                    display: 'flex', alignItems: 'flex-end',
                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center 38%',
                }}
            >
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(120deg, rgba(5,5,8,0.25) 0%, rgba(5,5,8,0.55) 45%, rgba(5,5,8,0.97) 100%)',
                    }}
                ></div>
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 20% 20%, rgba(92,141,137,0.22), transparent 55%)',
                    }}
                ></div>
                <div className="container-fluid px-4 px-lg-5 pb-4" style={{ position: 'relative', zIndex: 2 }}>
                    <div
                        className="text-uppercase mb-2"
                        style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', letterSpacing: '0.25em', fontWeight: 600 }}
                    >
                        CineReseñas
                    </div>
                    <h1
                        className="titulo-cine text-white mb-2"
                        style={{ fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', letterSpacing: '0.01em' }}
                    >
                        Bienvenido, {auth?.user?.nombre}
                    </h1>
                    <p className="text-light mb-3" style={{ fontSize: '0.95rem', opacity: 0.85, maxWidth: '640px' }}>
                        Descubre las películas mejor valoradas, lo nuevo en la plataforma y recomendaciones hechas para ti.
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                        {generos.slice(0, 8).map((g, idx) => (
                            <Link
                                key={g.id}
                                href={route('user.catalogo', { genero_id: g.id })}
                                className="badge-genero-home rounded-pill text-decoration-none"
                                style={{
                                    color: '#fff', fontSize: '0.75rem', padding: '6px 14px',
                                    animationDelay: `${idx * 0.3}s`, cursor: 'pointer',
                                }}
                            >
                                {g.nombre}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ backgroundColor: '#000', paddingTop: '10px', paddingBottom: '60px' }}>
                <div className="container-fluid px-4 px-lg-5">
                    <MovieRow titulo="Mejor valoradas" peliculas={mejorValoradas} onAbrir={abrir} />
                    <MovieRow titulo="Nuevas en la plataforma" peliculas={nuevas} onAbrir={abrir} />
                    <MovieRow titulo="Recomendadas para ti" peliculas={recomendadas} onAbrir={abrir} />
                </div>
            </section>

            {peliculaAbierta && <MovieModal pelicula={peliculaAbierta} onClose={() => setPeliculaAbierta(null)} />}
        </AuthenticatedLayout>
    );
}