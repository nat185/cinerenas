import React, { useState, useEffect } from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react';

const MENUS = {
    admin: [
        { label: 'Dashboard', icon: 'fa-tachometer-alt', route: 'admin.dashboard' },
        { label: 'Películas y Reseñas', icon: 'fa-film', route: 'admin.peliculas' },
        { label: 'Comentarios de Usuarios', icon: 'fa-comments', route: 'admin.comentarios' },
        { label: 'Usuarios', icon: 'fa-users', route: 'admin.usuarios' },
        { label: 'Estadísticas', icon: 'fa-chart-bar', route: 'admin.estadisticas' },
        { label: 'Moderación', icon: 'fa-shield-alt', route: 'admin.moderacion' },
        { label: 'Configuración', icon: 'fa-cog', route: 'admin.configuracion' },
    ],
    editor: [
        { label: 'Dashboard', icon: 'fa-tachometer-alt', route: 'editor.dashboard' },
        { label: 'Películas', icon: 'fa-film', route: 'editor.peliculas' },
        { label: 'Reseñas', icon: 'fa-pen-nib', route: 'editor.resenas' },
        { label: 'Comentarios', icon: 'fa-comments', route: 'editor.comentarios' },
        { label: 'Estadísticas', icon: 'fa-chart-bar', route: 'editor.estadisticas' },
        { label: 'Perfil', icon: 'fa-user', route: 'editor.perfil' },
    ],
    usuario: [
        { label: 'Inicio', route: 'user.inicio', icon: 'fa-home' },
        { label: 'Películas', route: 'user.catalogo', icon: 'fa-film' },
        { label: 'Reseñas', route: 'user.resenas', icon: 'fa-pen-nib' },
        { label: 'Mis Favoritos', route: 'user.favoritos', icon: 'fa-heart' },
        { label: 'Películas Vistas', route: 'user.vistas', icon: 'fa-eye' },
        { label: 'Mi Perfil', route: 'user.perfil', icon: 'fa-user' },
    ],
};

export default function AuthenticatedLayout({ auth, title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const { url } = usePage();

    // ========================================================
    // GESTIÓN DE TOKEN ÚNICO POR PESTAÑA (SESSIONSTORAGE)
    // ========================================================
    useEffect(() => {
        let tabToken = sessionStorage.getItem('tab_token');
        if (!tabToken) {
            tabToken = Math.random().toString(36).substring(2);
            sessionStorage.setItem('tab_token', tabToken);
        }

        const removeEventListener = router.on('before', (event) => {
            event.detail.visit.headers['X-Tab-Token'] = tabToken;
        });

        return () => {
            if (typeof removeEventListener === 'function') {
                removeEventListener();
            }
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ========================================================
    // CONTROL DE INACTIVIDAD DE 15 MINUTOS EN EL CLIENTE
    // ========================================================
    useEffect(() => {
        let inactivityTimeout;

        const logoutDueToInactivity = () => {
            router.post(safeRoute('logout'), { reason: 'inactivity' });
        };

        const resetTimer = () => {
            clearTimeout(inactivityTimeout);
            inactivityTimeout = setTimeout(logoutDueToInactivity, 15 * 60 * 1000);
        };

        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(inactivityTimeout);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, []);

    const rawRole = auth?.user?.role || auth?.user?.rol || 'usuario';
    const normalizedRole = rawRole.toLowerCase();
    const menuKey = normalizedRole === 'administrador' ? 'admin' : (MENUS[normalizedRole] ? normalizedRole : 'usuario');
    const menu = MENUS[menuKey] || MENUS['usuario'];

    const safeRoute = (name) => {
        try {
            return route(name);
        } catch (e) {
            return '#';
        }
    };

    const isActive = (name) => {
        try {
            const routePath = new URL(route(name), window.location.origin).pathname;
            return url === routePath || url.startsWith(routePath + '/');
        } catch (e) {
            return false;
        }
    };

    const headerTextColor = scrolled ? '#212529' : '#ffffff';

    return (
        <div style={{ fontFamily: "'Lora', Georgia, serif" }}>

            <Head title={title}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                h1, h2, h3, h4, h5, h6, .font-heading {
                    font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif !important;
                    letter-spacing: 0.5px;
                }

                body, p, span, li, div {
                    font-family: 'Lora', Georgia, serif;
                }
            `}</style>

            {/* ===== HEADER ===== */}
            <nav
                className={scrolled ? 'shadow-sm' : ''}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.25rem',
                    backgroundColor: scrolled ? '#ffffff' : 'transparent',
                    transition: 'background-color 0.3s ease',
                    zIndex: 1050,
                }}
            >
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Alternar menú"
                        style={{
                            width: '38px',
                            height: '32px',
                            border: `1px solid ${headerTextColor}`,
                            backgroundColor: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                        }}
                    >
                        <span style={{ display: 'block', width: '18px', height: '2px', backgroundColor: headerTextColor, transition: 'background-color 0.3s ease' }}></span>
                        <span style={{ display: 'block', width: '18px', height: '2px', backgroundColor: headerTextColor, transition: 'background-color 0.3s ease' }}></span>
                        <span style={{ display: 'block', width: '18px', height: '2px', backgroundColor: headerTextColor, transition: 'background-color 0.3s ease' }}></span>
                    </button>

                    <span
                        className="font-heading fw-bold text-uppercase"
                        style={{
                            color: headerTextColor,
                            transition: 'color 0.3s ease',
                            fontSize: '1rem'
                        }}
                    >
                        CineReseñas
                    </span>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="text-end" style={{ lineHeight: 1.3 }}>
                        <div
                            style={{
                                color: headerTextColor,
                                transition: 'color 0.3s ease',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}
                        >
                            {auth?.user?.nombre || auth?.user?.name}
                        </div>
                        <span
                            className="badge bg-primary text-uppercase"
                            style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}
                        >
                            {menuKey}
                        </span>
                    </div>

                    {/* ===== BOTÓN CERRAR SESIÓN ===== */}
                    <button
                        type="button"
                        onClick={() => router.post(safeRoute('logout'))}
                        title="Cerrar sesión"
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '6px',
                            color: headerTextColor,
                            transition: 'color 0.3s ease',
                            fontSize: '1.1rem',
                            lineHeight: 1,
                            cursor: 'pointer',
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </nav>

            {/* ===== SIDEBAR ===== */}
            <aside
                className="bg-black"
                style={{
                    position: 'fixed',
                    top: '64px',
                    bottom: 0,
                    left: 0,
                    width: '250px',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-250px)',
                    transition: 'transform 0.25s ease',
                    zIndex: 1040,
                    overflowY: 'auto',
                }}
            >
                <ul className="list-unstyled d-flex flex-column gap-1 p-3 mb-0">
                    {menu.map((item) => {
                        const active = isActive(item.route);
                        return (
                            <li key={item.route}>
                                <Link
                                    href={safeRoute(item.route)}
                                    className={`text-decoration-none d-flex align-items-center gap-3 p-2 rounded ${
                                        active
                                            ? 'text-white bg-primary bg-opacity-25 border-start border-primary border-3'
                                            : 'text-white-50'
                                    }`}
                                >
                                    <i
                                        className={`fas ${item.icon} ${active ? 'text-primary' : ''}`}
                                        style={{ width: '18px', textAlign: 'center' }}
                                    ></i>
                                    <span style={{ color: active ? '#ffffff' : 'inherit' }}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            {/* ===== CONTENIDO ===== */}
            <main
                style={{
                    marginLeft: sidebarOpen ? '250px' : '0',
                    transition: 'margin-left 0.25s ease'
                }}
            >
                {children}
            </main>
        </div>
    );
}