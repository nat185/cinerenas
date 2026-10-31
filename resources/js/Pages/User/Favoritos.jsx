import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Favoritos({ auth, favoritosPeliculas = [], favoritosResenas = [] }) {
    return (
        <AuthenticatedLayout auth={auth} title="Mis Favoritos">
            <Head title="Mis Favoritos" />
            
            <div className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 100px)' }}>
                <div className="container-fluid px-4">
                    <h2 className="mb-4 text-dark font-heading" style={{ fontWeight: '600' }}>
                        <i className="fas fa-heart text-danger me-2"></i>Mis Favoritos
                    </h2>

                    {/* Películas Favoritas */}
                    <h4 className="text-secondary mb-3" style={{ fontSize: '1.2rem' }}>Películas Favoritas</h4>
                    {favoritosPeliculas.length > 0 ? (
                        <div className="row g-3 mb-5">
                            {favoritosPeliculas.map((pelicula) => (
                                <div key={pelicula.id} className="col-md-3 col-sm-6">
                                    <div className="card h-100 shadow-sm border-0">
                                        <img 
                                            src={pelicula.poster ? `/storage/${pelicula.poster}` : '/dist/assets/img/posters/default.jpg'} 
                                            className="card-img-top" 
                                            alt={pelicula.titulo}
                                            style={{ height: '280px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title text-dark" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{pelicula.titulo}</h5>
                                            <p className="card-text text-muted small mb-0">{pelicula.genero} ({pelicula.anio})</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted mb-5">No tienes películas marcadas como favoritas todavía.</p>
                    )}

                    {/* Reseñas Guardadas */}
                    <h4 className="text-secondary mb-3" style={{ fontSize: '1.2rem' }}>Reseñas Guardadas</h4>
                    {favoritosResenas.length > 0 ? (
                        <div className="row g-3">
                            {favoritosResenas.map((resena) => (
                                <div key={resena.id} className="col-md-6">
                                    <div className="card shadow-sm border-0 p-3 mb-3">
                                        <h5 className="text-dark fw-bold">{resena.titulo}</h5>
                                        <p className="text-muted small">Película: {resena.pelicula} | Autor: {resena.autor}</p>
                                        <p className="text-secondary">{resena.contenido}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted">No tienes reseñas guardadas.</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}