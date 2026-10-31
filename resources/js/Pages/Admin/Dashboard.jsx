import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import {
    MiniBarChart,
    KpiCard,
    PosterThumb
} from '@/Components/AdminWidgets';

export default function AdminDashboard({
    auth,
    stats = {},
    usuariosPorSemana = [],
    tematicasPopulares = [],
    pendientes = [],
    rankingPeliculas = [],
    rankingVistas = [],
    actividadReciente = []
}) {
    // Normalización de objetos y valores con fallbacks seguros
    const safeStats = {
        usuariosRegistrados: stats?.usuariosRegistrados ?? 0,
        usuariosNuevosSemana: stats?.usuariosNuevosSemana ?? 0,
        peliculasRegistradas: stats?.peliculasRegistradas ?? 0,
        resenasCreadas: stats?.resenasCreadas ?? 0,
        comentariosRealizados: stats?.comentariosRealizados ?? 0,
        promedioValoracion: stats?.promedioValoracion ?? 0
    };

    // Estado para controlar la visibilidad del botón de "volver arriba"
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            title="Panel de Administración"
        >
            {/* Estilo para hacer la barra de navegación transparente en este layout */}
            <style>{`
                nav.navbar, .navbar {
                    background-color: transparent !important;
                    position: absolute !important;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1030;
                }
            `}</style>

            {/* =========================================================
                HERO CINEMATOGRÁFICO
            ========================================================= */}
            <section
                id="inicio"
                style={{
                    position: 'relative',
                    minHeight: '460px',
                    paddingTop: '80px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage:
                        "url('/dist/assets/img/bg-masthead.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.98) 100%)',
                        zIndex: 1
                    }}
                ></div>

                <div
                    className="container px-4 px-lg-5"
                    style={{
                        position: 'relative',
                        zIndex: 3,
                        paddingTop: '40px',
                        paddingBottom: '40px',
                        width: '100%'
                    }}
                >
                    <div style={{ maxWidth: '760px' }}>
                        <div
                            className="text-uppercase"
                            style={{
                                color: 'rgba(255,255,255,0.65)',
                                fontSize: '0.72rem',
                                letterSpacing: '0.22em',
                                fontWeight: '600',
                                marginBottom: '12px'
                            }}
                        >
                            CineReseñas · Administración
                        </div>
                        <h1
                            className="font-heading text-white"
                            style={{
                                fontSize: 'clamp(2rem, 4vw, 3.3rem)',
                                lineHeight: '1.08',
                                fontWeight: '600',
                                marginBottom: '14px',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Panel de Administración
                        </h1>
                        <p
                            style={{
                                color: 'rgba(255,255,255,0.78)',
                                fontSize: '1rem',
                                lineHeight: '1.7',
                                maxWidth: '620px',
                                marginBottom: '24px'
                            }}
                        >
                            Bienvenido de nuevo, {auth?.user?.nombre}.
                            Aquí puedes consultar el estado general de
                            CineReseñas y supervisar su actividad.
                        </p>

                        <div className="d-flex flex-wrap gap-2 mb-4">
                            <a
                                href="#seccion-kpis"
                                className="btn btn-sm btn-outline-light px-3 py-2"
                                style={{
                                    fontSize: '0.8rem',
                                    borderRadius: '2px',
                                    backdropFilter: 'blur(4px)',
                                    background: 'rgba(255,255,255,0.08)'
                                }}
                            >
                                <i className="fas fa-chart-pie me-2"></i> Estado General
                            </a>
                            <a
                                href="#seccion-analitica"
                                className="btn btn-sm btn-outline-light px-3 py-2"
                                style={{
                                    fontSize: '0.8rem',
                                    borderRadius: '2px',
                                    backdropFilter: 'blur(4px)',
                                    background: 'rgba(255,255,255,0.08)'
                                }}
                            >
                                <i className="fas fa-chart-line me-2"></i> Analítica y Pendientes
                            </a>
                            <a
                                href="#seccion-rankings"
                                className="btn btn-sm btn-outline-light px-3 py-2"
                                style={{
                                    fontSize: '0.8rem',
                                    borderRadius: '2px',
                                    backdropFilter: 'blur(4px)',
                                    background: 'rgba(255,255,255,0.08)'
                                }}
                            >
                                <i className="fas fa-trophy me-2"></i> Rankings y Control
                            </a>
                        </div>

                        <div
                            className="d-flex flex-wrap gap-4 pt-3"
                            style={{
                                color: '#ffffff',
                                borderTop: '1px solid rgba(255,255,255,0.15)'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '1.55rem', fontWeight: '600' }}>
                                    {pendientes.reduce((total, item) => total + (item.value || 0), 0)}
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.72rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        color: 'rgba(255,255,255,0.58)'
                                    }}
                                >
                                    Pendientes
                                </div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }}></div>
                            <div>
                                <div style={{ fontSize: '1.55rem', fontWeight: '600' }}>
                                    {safeStats.promedioValoracion}
                                    <span style={{ fontSize: '0.95rem', marginLeft: '4px' }}>★</span>
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.72rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        color: 'rgba(255,255,255,0.58)'
                                    }}
                                >
                                    Valoración media
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                ESTADO DE LA PLATAFORMA (KPIs)
            ========================================================= */}
            <section
                id="seccion-kpis"
                style={{
                    backgroundColor: '#ffffff',
                    paddingTop: '55px',
                    paddingBottom: '55px'
                }}
            >
                <div className="container px-4 px-lg-5">
                    <div
                        className="d-flex justify-content-between align-items-end flex-wrap"
                        style={{ marginBottom: '28px' }}
                    >
                        <div>
                            <div
                                className="text-uppercase text-muted"
                                style={{ fontSize: '0.68rem', letterSpacing: '0.18em', marginBottom: '7px' }}
                            >
                                Resumen
                            </div>
                            <h2
                                className="font-heading mb-0"
                                style={{ fontSize: '1.45rem', fontWeight: '600', color: '#202020' }}
                            >
                                Estado de la plataforma
                            </h2>
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                            Datos generales del sistema
                        </span>
                    </div>
                    <div className="row gx-3 gy-3">
                        <KpiCard label="Usuarios Registrados" value={safeStats.usuariosRegistrados} />
                        <KpiCard label="Nuevos esta semana" value={`+${safeStats.usuariosNuevosSemana}`} />
                        <KpiCard label="Películas Registradas" value={safeStats.peliculasRegistradas} />
                        <KpiCard label="Reseñas Creadas" value={safeStats.resenasCreadas} />
                        <KpiCard label="Comentarios" value={safeStats.comentariosRealizados} />
                        <KpiCard label="Valoración Promedio" value={`${safeStats.promedioValoracion} ★`} />
                    </div>
                </div>
            </section>

            {/* =========================================================
                ANALÍTICA + PENDIENTES
            ========================================================= */}
            <section
                id="seccion-analitica"
                style={{
                    position: 'relative',
                    paddingTop: '65px',
                    paddingBottom: '65px',
                    overflow: 'hidden',
                    backgroundColor: '#f1f1f1'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 65%',
                        opacity: 0.07
                    }}
                ></div>
                <div className="container px-4 px-lg-5" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="row gx-4 gy-4">
                        {/* GRÁFICA */}
                        <div className="col-lg-7">
                            <div
                                className="card border-0 shadow-sm h-100"
                                style={{ borderRadius: '2px', overflow: 'hidden' }}
                            >
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '105px',
                                        backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center 35%'
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(90deg, rgba(15,15,15,0.91), rgba(15,15,15,0.55))'
                                        }}
                                    ></div>
                                    <div
                                        style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            padding: '0 28px'
                                        }}
                                    >
                                        <div
                                            className="text-uppercase"
                                            style={{
                                                color: 'rgba(255,255,255,0.58)',
                                                fontSize: '0.66rem',
                                                letterSpacing: '0.18em',
                                                marginBottom: '5px'
                                            }}
                                        >
                                            Actividad
                                        </div>
                                        <h3
                                            className="font-heading text-white mb-0"
                                            style={{ fontSize: '1.2rem', fontWeight: '600' }}
                                        >
                                            Usuarios registrados
                                        </h3>
                                    </div>
                                </div>
                                <div style={{ padding: '30px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                                            Últimas cuatro semanas
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                            +{safeStats.usuariosNuevosSemana} esta semana
                                        </span>
                                    </div>
                                    <MiniBarChart data={usuariosPorSemana} />
                                </div>
                            </div>
                        </div>

                        {/* PENDIENTES DINÁMICOS */}
                        <div className="col-lg-5">
                            <div
                                className="h-100"
                                style={{
                                    position: 'relative',
                                    minHeight: '100%',
                                    overflow: 'hidden',
                                    borderRadius: '2px',
                                    backgroundImage: "url('/dist/assets/img/bg-masthead.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center right',
                                    color: '#ffffff'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, rgba(20,20,20,0.96), rgba(25,25,25,0.78))'
                                    }}
                                ></div>
                                <div style={{ position: 'relative', zIndex: 2, padding: '32px' }}>
                                    <div
                                        className="text-uppercase"
                                        style={{
                                            color: 'rgba(255,255,255,0.52)',
                                            fontSize: '0.66rem',
                                            letterSpacing: '0.18em',
                                            marginBottom: '7px'
                                        }}
                                    >
                                        Atención requerida
                                    </div>
                                    <h3
                                        className="font-heading"
                                        style={{ fontSize: '1.35rem', fontWeight: '600', marginBottom: '6px' }}
                                    >
                                        Pendientes
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.8rem', marginBottom: '27px' }}>
                                        Elementos que requieren supervisión.
                                    </p>
                                    {pendientes.length > 0 ? (
                                        pendientes.map((item, index) => (
                                            <div
                                                key={item.label || index}
                                                style={{
                                                    padding: '13px 0',
                                                    borderTop:
                                                        index === 0
                                                            ? '1px solid rgba(255,255,255,0.12)'
                                                            : '1px solid rgba(255,255,255,0.08)'
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.85)' }}>
                                                        {item.label}
                                                    </span>
                                                    <span
                                                        className={`badge rounded-pill ${item.value > 0 ? 'bg-danger' : 'bg-secondary'}`}
                                                        style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.35em 0.65em' }}
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                                            Sin pendientes actualmente.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SECCIÓN DARK: RANKINGS Y CONTROL
            ========================================================= */}
            <section
                id="seccion-rankings"
                style={{
                    position: 'relative',
                    paddingTop: '60px',
                    paddingBottom: '60px',
                    backgroundColor: '#121212',
                    color: '#ffffff'
                }}
            >
                <div className="container px-4 px-lg-5">
                    <div className="row gx-5 gy-4">
                        {/* MEJOR VALORADAS */}
                        <div className="col-lg-4">
                            <div
                                className="text-uppercase"
                                style={{
                                    color: 'rgba(255,255,255,0.48)',
                                    fontSize: '0.66rem',
                                    letterSpacing: '0.18em',
                                    marginBottom: '8px'
                                }}
                            >
                                Catálogo
                            </div>
                            <h3
                                className="font-heading text-white"
                                style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px' }}
                            >
                                Mejor valoradas
                            </h3>
                            <div className="d-flex flex-column gap-3">
                                {rankingPeliculas.length > 0 ? (
                                    rankingPeliculas.map((pelicula, idx) => (
                                        <div
                                            key={pelicula.titulo || idx}
                                            className="d-flex align-items-center gap-3"
                                            style={{
                                                paddingBottom: '12px',
                                                borderBottom: '1px solid rgba(255,255,255,0.08)'
                                            }}
                                        >
                                            <PosterThumb src={pelicula.poster} alt={pelicula.titulo} />
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        color: '#ffffff',
                                                        marginBottom: '2px'
                                                    }}
                                                >
                                                    {pelicula.titulo}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#ffc107' }}>
                                                    {pelicula.valoracion} ★
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                                        No hay películas registradas.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MÁS VISTAS */}
                        <div className="col-lg-4">
                            <div
                                className="text-uppercase"
                                style={{
                                    color: 'rgba(255,255,255,0.48)',
                                    fontSize: '0.66rem',
                                    letterSpacing: '0.18em',
                                    marginBottom: '8px'
                                }}
                            >
                                Audiencia
                            </div>
                            <h3
                                className="font-heading text-white"
                                style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px' }}
                            >
                                Más vistas
                            </h3>
                            <div className="d-flex flex-column gap-3">
                                {rankingVistas.length > 0 ? (
                                    rankingVistas.map((item, idx) => (
                                        <div
                                            key={item.titulo || idx}
                                            className="d-flex justify-content-between align-items-center"
                                            style={{
                                                paddingBottom: '12px',
                                                borderBottom: '1px solid rgba(255,255,255,0.08)'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.88rem', color: '#e0e0e0' }}>
                                                {item.titulo}
                                            </span>
                                            <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                                {item.vistas} vistas
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                                        Sin datos de audiencia.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CENTRO DE CONTROL / ACTIVIDAD RECIENTE */}
                        <div className="col-lg-4">
                            <div
                                style={{
                                    padding: '28px',
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: '2px'
                                }}
                            >
                                <div
                                    className="text-uppercase"
                                    style={{
                                        color: 'rgba(255,255,255,0.45)',
                                        fontSize: '0.62rem',
                                        letterSpacing: '0.18em',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Centro de control
                                </div>
                                <h3
                                    className="font-heading text-white"
                                    style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '18px' }}
                                >
                                    CineReseñas
                                </h3>
                                {actividadReciente.length > 0 ? (
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        {actividadReciente.map((act, idx) => (
                                            <div key={idx} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                                <i className={`fas ${act.icono || 'fa-history'} me-2 text-white-50`}></i>
                                                {act.texto} <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>({act.tiempo})</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: '0.82rem',
                                            lineHeight: '1.7',
                                            marginBottom: '20px'
                                        }}
                                    >
                                        Supervisa usuarios, contenido, comentarios y actividad desde un mismo espacio.
                                    </div>
                                )}
                                <div
                                    className="d-flex justify-content-between"
                                    style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>Sistema</span>
                                    <span style={{ color: '#00ff88', fontSize: '0.72rem', fontWeight: '600' }}>Operativo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOTÓN FLOTANTE PARA REGRESAR ARRIBA */}
            {showTopBtn && (
                <button
                    onClick={scrollToTop}
                    title="Volver arriba"
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 1050,
                        backgroundColor: 'rgba(20, 20, 20, 0.85)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        width: '45px',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(20, 20, 20, 0.85)')}
                >
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}
        </AuthenticatedLayout>
    );
}