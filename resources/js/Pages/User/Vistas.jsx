import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Vistas({ auth, peliculas = [], generos = [], filtros = {} }) {
    const { data, setData, get } = useForm({
        q: filtros.q || '',
        genero_id: filtros.genero_id || '',
        anio: filtros.anio || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        get(route('user.vistas'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout auth={auth} title="Películas Vistas">
            <Head title="Películas Vistas" />

            <div className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 100px)' }}>
                <div className="container-fluid px-4">
                    <h2 className="mb-4 text-dark font-heading" style={{ fontWeight: '600' }}>
                        <i className="fas fa-eye text-primary me-2"></i>Películas Vistas
                    </h2>

                    {/* Filtros */}
                    <form onSubmit={handleFilter} className="row g-2 mb-4 bg-white p-3 shadow-sm rounded">
                        <div className="col-md-4">
                            <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                placeholder="Buscar título..." 
                                value={data.q} 
                                onChange={e => setData('q', e.target.value)} 
                            />
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select form-select-sm" 
                                value={data.genero_id} 
                                onChange={e => setData('genero_id', e.target.value)}
                            >
                                <option value="">Todos los géneros</option>
                                {generos.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                placeholder="Año" 
                                value={data.anio} 
                                onChange={e => setData('anio', e.target.value)} 
                            />
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary btn-sm w-100">Filtrar</button>
                        </div>
                    </form>

                    {/* Listado */}
                    {peliculas.length > 0 ? (
                        <div className="row g-3">
                            {peliculas.map((pelicula) => (
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
                        <p className="text-muted">No has marcado ninguna película como vista con estos filtros.</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}