import React, { useRef, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MiPlantillaLayout from '@/Layouts/MiPlantillaLayout';

// APARTADO 1: Carrusel de películas ("Historias Guardadas en la Penumbra" - #trending)
const MOVIES = [
    {
        seccion: 'Carrusel / Trending',
        title: 'The Dark Knight',
        rating: '4.9 ★',
        year: '2008',
        review: 'Una obra maestra del género superhéroes. Heath Ledger entrega una actuación memorable e inolvidable como el Guasón.',
        img: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg'
    },
    {
        seccion: 'Carrusel / Trending',
        title: 'Interstellar',
        rating: '4.9 ★',
        year: '2014',
        review: 'Un viaje emocional y visualmente asombroso a través del espacio y el tiempo con una banda sonora sublime de Hans Zimmer.',
        img: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
    },
    {
        seccion: 'Carrusel / Trending',
        title: 'Blade Runner 2049',
        rating: '4.8 ★',
        year: '2017',
        review: 'Fotografía impecable y una atmósfera ciberpunk envolvente que expande con maestría el universo del clásico de culto.',
        img: 'https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_FMjpg_UX1000_.jpg'
    },
    {
        seccion: 'Carrusel / Trending',
        title: 'La La Land',
        rating: '4.7 ★',
        year: '2016',
        review: 'Una carta de amor al cine clásico y al jazz. Química electrizante entre Ryan Gosling y Emma Stone.',
        img: 'https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_FMjpg_UX1000_.jpg'
    },
    {
        seccion: 'Carrusel / Trending',
        title: 'Inception',
        rating: '4.8 ★',
        year: '2010',
        review: 'Un thriller sci-fi dinámico y complejo que desafía la percepción entre los sueños y la realidad.',
        img: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg'
    },
    {
        seccion: 'Carrusel / Trending',
        title: 'Oppenheimer',
        rating: '4.9 ★',
        year: '2023',
        review: 'Retrato biográfico tenso e hipnótico sobre el nacimiento de la era atómica con una dirección magistral.',
        img: 'https://m.media-amazon.com/images/M/MV5BNTFlZDI1YWQtMTVjNy00YWU1LTg2YjktMTlhYmRiYzQ3NTVhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'
    },
];

// APARTADO 2: Tarjetas de testimonios/reseñas ("Análisis y Testimonios Recientes" - #projects)
const REVIEWS = [
    {
        seccion: 'Sección Reseñas / Testimonios',
        stars: '★★★★★',
        title: 'Análisis Detallados',
        quote: '"Publica tus críticas minuciosas, califica tus películas favoritas y conecta con la comunidad."',
        author: 'Carlos M., Crítico Principal',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=75&w=800&auto=format&fit=crop',
        reverse: false,
    },
    {
        seccion: 'Sección Reseñas / Testimonios',
        stars: '★★★★☆',
        title: 'Comunidad Cinéfila',
        quote: '"Un espacio ideal para debatir finales alternativos, teorías y recomendaciones genuinas."',
        author: 'Ana R., Miembro Activo',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=75&w=800&auto=format&fit=crop',
        reverse: true,
    },
];

export default function Welcome() {
    const sliderRef = useRef(null);
    const [pausarCarrusel, setPausarCarrusel] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!pausarCarrusel && sliderRef.current) {
                const maxScrollLeft = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
                if (sliderRef.current.scrollLeft >= maxScrollLeft - 5) {
                    sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    sliderRef.current.scrollBy({ left: 220, behavior: 'smooth' });
                }
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [pausarCarrusel]);

    const handleScroll = (direction) => {
        setPausarCarrusel(true);
        if (sliderRef.current) {
            const scrollAmount = 220;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MiPlantillaLayout>
            <Head>
                <title>CineReseñas - Inicio</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&display=swap" rel="stylesheet" />
            </Head>

            <style>{`
                .welcome-page-wrap {
                    overflow-x: clip;
                    width: 100%;
                }

                .font-cinema-sub {
                    font-family: 'Pacifico', cursive;
                    font-size: clamp(1.05rem, 4vw, 1.6rem);
                    color: #ffffff;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                    display: block;
                    margin-bottom: 2px;
                }

                @keyframes cinemaAtmosphere {
                    0% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1)); opacity: 0.95; }
                    50% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3)); opacity: 1; }
                    100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1)); opacity: 0.95; }
                }

                @keyframes fadeInHero {
                    from { opacity: 0; transform: scale(0.97) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .font-cinema-retro {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(1.45rem, 6.6vw, 4rem);
                    line-height: 1.05;
                    letter-spacing: 2px;
                    color: #121212;
                    display: inline-block;
                    max-width: 100%;
                    white-space: nowrap;
                    transform: skewX(-4deg) rotate(-1.5deg);
                    text-shadow:
                        1px 1px 0px #e0e0e0, 2px 2px 0px #d6d6d6, 3px 3px 0px #cccccc,
                        4px 4px 0px #c2c2c2, 5px 5px 0px #b8b8b8, 6px 6px 8px rgba(0, 0, 0, 0.6);
                    animation: fadeInHero 0.8s ease-out forwards, cinemaAtmosphere 5s ease-in-out infinite 1s;
                }

                .hero-lead-text {
                    font-size: clamp(0.88rem, 3.6vw, 1rem);
                    font-weight: 300;
                    max-width: 620px;
                    letter-spacing: 0.2px;
                    line-height: 1.55;
                    overflow-wrap: break-word;
                }

                .carousel-container { position: relative; width: 100%; }

                .carousel-slider {
                    display: flex;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    padding: 15px 6px;
                }
                .carousel-slider::-webkit-scrollbar { display: none; }

                .movie-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .movie-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.8);
                }

                .movie-review-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(10, 10, 12, 0.92);
                    backdrop-filter: blur(4px);
                    color: #fff;
                    padding: 0.9rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 5;
                }

                .movie-card:hover .movie-review-overlay { opacity: 1; }

                .carousel-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    opacity: 0;
                    transition: opacity 0.3s ease, background 0.3s ease, transform 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .carousel-container:hover .carousel-btn { opacity: 1; }
                .carousel-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-50%) scale(1.05); }
                .carousel-btn.prev { left: 10px; }
                .carousel-btn.next { right: 10px; }

                @media (max-width: 768px) {
                    .font-cinema-retro {
                        font-size: clamp(1.45rem, 6.6vw, 2.2rem);
                        letter-spacing: 0px;
                        transform: none;
                        text-shadow:
                            1px 1px 0px #e0e0e0,
                            2px 2px 0px #cccccc,
                            3px 3px 5px rgba(0, 0, 0, 0.65);
                    }
                    .carousel-btn {
                        width: 34px;
                        height: 34px;
                        font-size: 0.85rem;
                        opacity: 0.75;
                    }
                    .carousel-btn.prev { left: 4px; }
                    .carousel-btn.next { right: 4px; }
                }

                .forest-transition-bg {
                    background: linear-gradient(180deg, rgba(0, 0, 0, 0.88) 0%, #0c0f12 35%, #0c0f12 70%, #000000 100%);
                    border: none !important;
                }

                .signup-section, footer, .border-no-line {
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                }

                .btn-scroll-top {
                    background-color: #64a19d;
                    color: #ffffff;
                    border: none;
                    font-weight: 700;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease-in-out;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .btn-scroll-top:hover {
                    background-color: #528985;
                    transform: translateY(-3px);
                    box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.5);
                    color: #ffffff;
                }
            `}</style>

            <div className="welcome-page-wrap">
                {/* APARTADO HERO / PORTADA (usa fondo de MiPlantillaLayout) */}
                <header className="masthead py-4 py-md-5" data-apartado="Hero / Portada" style={{ minHeight: '78vh', display: 'flex', alignItems: 'center' }}>
                    <div className="container px-3 px-sm-4 px-lg-5 d-flex align-items-center justify-content-center">
                        <div className="text-center py-3 w-100">
                            <span className="font-cinema-sub">El Portal de</span>
                            <h1 className="mx-auto my-2 font-cinema-retro">
                                CINERESEÑAS
                            </h1>

                            <h2 className="text-white-50 mx-auto mt-3 mb-4 px-1 hero-lead-text">
                                Donde las voces se pierden en la bruma y solo permanece el veredicto de la pantalla. Un santuario silencioso para desentrañar historias, discutir teorías sin rostro y calificar el arte del cine.
                            </h2>

                            <Link className="btn btn-primary text-uppercase px-4 py-2 rounded-pill fw-bold shadow" href={route('login')} style={{ fontSize: '0.88rem' }}>
                                Comenzar Ahora
                            </Link>
                        </div>
                    </div>
                </header>

                {/* APARTADO 1: CARRUSEL DE PÓSTERS (#trending) */}
                <section className="py-5 forest-transition-bg text-white position-relative" id="trending" data-apartado="Carrusel Trending">
                    <div className="container px-3 px-sm-4 px-lg-5 mb-3 text-center">
                        <h3 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.2rem, 4.5vw, 1.65rem)' }}>
                            Historias Guardadas en la Penumbra
                        </h3>
                        <p className="text-white-50 mx-auto mb-0 hero-lead-text">
                            Desliza entre los archivos cinemáticos. Mantén el cursor o toca cualquier póster para revelar los fragmentos y notas dejadas por el grupo editorial.
                        </p>
                    </div>

                    <div
                        className="container-fluid px-2 px-md-4 carousel-container"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={() => setPausarCarrusel(true)}
                    >
                        <button className="carousel-btn prev" onClick={() => handleScroll('left')} aria-label="Anterior">❮</button>
                        <button className="carousel-btn next" onClick={() => handleScroll('right')} aria-label="Siguiente">❯</button>

                        <div className="carousel-slider" ref={sliderRef}>
                            {MOVIES.map((item, idx) => (
                                <div key={idx} className="pe-3 flex-shrink-0" style={{ width: '195px' }}>
                                    <div className="card movie-card bg-dark text-white rounded-3 overflow-hidden h-100 position-relative shadow-sm">
                                        <div className="movie-review-overlay">
                                            <span className="badge bg-warning text-dark mb-2 px-2 py-1 fw-bold" style={{ fontSize: '0.68rem' }}>
                                                {item.seccion}
                                            </span>
                                            <p className="fst-italic mb-2 text-white-50" style={{ fontSize: '0.76rem', lineHeight: '1.35' }}>
                                                "{item.review}"
                                            </p>
                                            <span className="fw-bold tracking-wide text-info" style={{ fontSize: '0.72rem' }}>
                                                {item.year} • {item.rating}
                                            </span>
                                        </div>

                                        <div style={{ height: '270px', overflow: 'hidden' }}>
                                            <img
                                                src={item.img}
                                                alt={`${item.title} (${item.seccion})`}
                                                width="180"
                                                height="270"
                                                loading={idx < 2 ? 'eager' : 'lazy'}
                                                decoding="async"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </div>

                                        <div className="card-body p-2 bg-dark text-center">
                                            <h6 className="fw-bold mb-1 text-truncate small">{item.title}</h6>
                                            <span className="small text-warning fw-semibold" style={{ fontSize: '0.78rem' }}>{item.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* APARTADO 2: SECCIÓN DE RESEÑAS (#projects) */}
                <section className="projects-section bg-light py-5" id="projects" data-apartado="Análisis y Testimonios">
                    <div className="container px-3 px-sm-4 px-lg-5">
                        <div className="text-center mb-4">
                            <h2 className="text-dark fw-bold" style={{ fontSize: 'clamp(1.35rem, 5vw, 1.9rem)' }}>
                                Análisis y Testimonios Recientes
                            </h2>
                            <p className="text-muted small mb-0">Ecos de quienes ya han compartido sus perspectivas.</p>
                        </div>

                        {REVIEWS.map((review, index) => (
                            <div key={index} className="row gx-0 mb-4 align-items-center bg-white rounded-4 shadow-sm p-3 border border-1 border-light">
                                <div className={`col-xl-7 col-lg-7 ${review.reverse ? 'order-lg-2' : ''} mb-3 mb-lg-0`}>
                                    <div className="overflow-hidden rounded-3 shadow-sm position-relative">
                                        <span
                                            className="badge bg-dark text-white position-absolute top-0 start-0 m-2"
                                            style={{ fontSize: '0.68rem', zIndex: 2 }}
                                        >
                                            {review.seccion}
                                        </span>
                                        <img
                                            className="img-fluid w-100"
                                            src={review.image}
                                            alt={`${review.title} - ${review.seccion}`}
                                            width="800"
                                            height="240"
                                            loading="lazy"
                                            decoding="async"
                                            style={{ maxHeight: '220px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                                <div className={`col-xl-5 col-lg-5 ${review.reverse ? 'order-lg-1 pe-lg-4' : 'ps-lg-4'}`}>
                                    <div className="text-center text-lg-start">
                                        <div className="text-warning mb-1 fs-6">{review.stars}</div>
                                        <h3 className="text-dark fw-bold mb-2 fs-5">{review.title}</h3>
                                        <p className="text-secondary mb-3 fst-italic small" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.55' }}>
                                            {review.quote}
                                        </p>
                                        <span className="text-dark fw-bold small text-uppercase" style={{ letterSpacing: '0.6px', fontSize: '0.72rem' }}>
                                            — {review.author}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* APARTADO 3: REGISTRO (#signup) */}
                <section className="signup-section py-5 bg-black border-no-line" id="signup" data-apartado="Registro">
                    <div className="container px-3 px-sm-4 px-lg-5">
                        <div className="row gx-4 gx-lg-5">
                            <div className="col-md-10 col-lg-8 mx-auto text-center">
                                <h2 className="text-white mb-2 fw-bold" style={{ fontSize: 'clamp(1.35rem, 5vw, 1.9rem)' }}>
                                    Forma Parte del Refugio
                                </h2>
                                <p className="text-white-50 mb-4 hero-lead-text mx-auto">
                                    Crea tu identidad y comienza a calificar y escribir sobre el séptimo arte.
                                </p>
                                <Link className="btn btn-primary text-uppercase px-4 py-2 rounded-pill fw-bold shadow small" href={route('register')}>
                                    Registrarse Gratis
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-black text-white-50 py-3 border-no-line position-relative" data-apartado="Footer">
                    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 100 }}>
                        <button
                            onClick={scrollToTop}
                            className="btn-scroll-top rounded-circle shadow"
                            style={{ width: '42px', height: '42px', fontSize: '1.05rem' }}
                            aria-label="Volver arriba"
                        >
                            ↑
                        </button>
                    </div>
                </footer>
            </div>
        </MiPlantillaLayout>
    );
}
