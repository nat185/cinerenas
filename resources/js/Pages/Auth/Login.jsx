import React, { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Login({ status, canResetPassword, session_conflict, conflict_email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        correo: conflict_email || '',
        contrasena: '',
        force_login: false,
    });

    const [showStatus, setShowStatus] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setShowStatus(true);
    }, [status]);

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        data.force_login = false;
        post(route('login'), {
            onError: () => reset('contrasena'),
        });
    };

    const forceLoginSubmit = (e) => {
        e.preventDefault();
        router.post(route('login'), {
            correo: data.correo,
            contrasena: data.contrasena,
            force_login: true,
        }, {
            onError: () => reset('contrasena'),
        });
    };

    return (
        <div id="page-top" className="bg-black text-white d-flex flex-column min-vh-100 justify-content-between">
            <Head>
                <title>Iniciar Sesión - CineReseñas</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
            </Head>

            <nav
                className={`navbar navbar-expand-lg fixed-top ${
                    scrolled
                        ? 'bg-white navbar-light shadow-sm py-2'
                        : 'bg-transparent navbar-dark py-2 py-md-3'
                }`}
                id="mainNav"
                style={{ transition: 'all 0.3s ease-in-out' }}
            >
                <div className="container px-4 px-lg-5">
                    <Link
                        className={`navbar-brand text-uppercase fw-bold ${
                            scrolled ? 'text-dark' : 'text-white'
                        }`}
                        style={{ letterSpacing: '2px', transition: 'color 0.3s ease-in-out', fontSize: '1.1rem' }}
                        href="/"
                    >
                        CineReseñas
                    </Link>
                </div>
            </nav>

            <header className="masthead flex-grow-1 d-flex align-items-center justify-content-center pt-5 pb-3 my-auto">
                <div className="container px-3 px-sm-4 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center w-100">
                        <div className="text-center w-100" style={{ maxWidth: '440px' }}>

                            <div
                                role="heading"
                                aria-level={1}
                                className="mx-auto mt-4 mt-md-2 mb-1 text-center"
                                style={{
                                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                                    fontFamily: "'Pacifico', cursive",
                                    color: '#ffffff',
                                    WebkitTextFillColor: '#ffffff',
                                    background: 'none',
                                    WebkitBackgroundClip: 'initial',
                                    opacity: 1,
                                    lineHeight: '1.3',
                                    padding: '5px 10px',
                                    overflow: 'visible',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    textShadow: '0 4px 15px rgba(0, 0, 0, 0.95)'
                                }}
                            >
                                Iniciar Sesión
                            </div>
                            <p
                                className="text-white-50 mx-auto mb-3 small fw-light"
                                style={{ letterSpacing: '0.8px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontSize: '0.85rem' }}
                            >
                                Accede a tu cuenta de CineReseñas
                            </p>

                            {status && showStatus && (
                                <div
                                    className="alert alert-info d-flex justify-content-between align-items-center text-start mb-3 py-2 px-3"
                                    style={{ fontSize: '0.85rem', borderRadius: '8px' }}
                                >
                                    <span className="me-2">{status}</span>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        aria-label="Cerrar"
                                        onClick={() => setShowStatus(false)}
                                        style={{ fontSize: '0.7rem' }}
                                    ></button>
                                </div>
                            )}

                            <div
                                className="card text-white p-3 p-sm-4 rounded-4 shadow-lg mx-auto w-100"
                                style={{
                                    backdropFilter: 'blur(12px)',
                                    backgroundColor: 'rgba(15, 15, 15, 0.85)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                            >
                                <form onSubmit={submit} className="text-start">
                                    <div className="mb-3">
                                        <InputLabel
                                            htmlFor="email"
                                            value="CORREO ELECTRÓNICO"
                                            className="text-white-50 small mb-1 text-uppercase fw-semibold"
                                            style={{ letterSpacing: '0.8px', fontSize: '0.75rem' }}
                                        />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.correo}
                                            className="mt-1 block w-full form-control bg-dark text-white py-2"
                                            style={{
                                                borderColor: '#64a19d',
                                                boxShadow: '0 0 5px rgba(100, 161, 157, 0.3)',
                                                fontSize: '0.9rem'
                                            }}
                                            autoComplete="username"
                                            isFocused={true}
                                            onChange={(e) => setData('correo', e.target.value)}
                                        />
                                        <InputError message={errors.correo} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <InputLabel
                                            htmlFor="password"
                                            value="CONTRASEÑA"
                                            className="text-white-50 small mb-1 text-uppercase fw-semibold"
                                            style={{ letterSpacing: '0.8px', fontSize: '0.75rem' }}
                                        />
                                        <div className="position-relative">
                                            <TextInput
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={data.contrasena}
                                                className="mt-1 block w-full form-control bg-dark text-white py-2 pe-5"
                                                style={{
                                                    borderColor: '#64a19d',
                                                    boxShadow: '0 0 5px rgba(100, 161, 157, 0.3)',
                                                    fontSize: '0.9rem'
                                                }}
                                                autoComplete="current-password"
                                                onChange={(e) => setData('contrasena', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="position-absolute top-50 end-0 translate-middle-y me-2 mt-1 d-flex align-items-center justify-content-center border-0 bg-transparent p-0"
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    color: '#64a19d',
                                                    cursor: 'pointer',
                                                    transition: 'color 0.2s ease, transform 0.2s ease',
                                                    outline: 'none',
                                                    boxShadow: 'none'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.color = '#8fd0cb'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.color = '#64a19d'; e.currentTarget.style.transform = ''; }}
                                                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.contrasena} className="mt-1 text-danger small" />
                                    </div>

                                    {session_conflict ? (
                                        <div className="d-grid gap-2 mt-4">
                                            <div
                                                className="text-start small py-2 px-3"
                                                style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', color: '#ff6b6b', borderRadius: '8px', fontSize: '0.8rem' }}
                                            >
                                                Tienes una sesión activa en este momento en otra pestaña o dispositivo. ¿Deseas cerrarla y continuar aquí?
                                            </div>
                                            <button
                                                type="button"
                                                onClick={forceLoginSubmit}
                                                className="btn btn-danger text-uppercase w-100 py-2 fw-bold text-white border-0 rounded-3 small"
                                                style={{ letterSpacing: '0.8px', fontSize: '0.8rem' }}
                                            >
                                                Cerrar sesión en el otro dispositivo e iniciar sesión en este
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-grid gap-2 mt-4">
                                            <button
                                                type="submit"
                                                className="btn text-uppercase w-100 justify-content-center py-2 fw-bold text-white border-0 rounded-3"
                                                disabled={processing}
                                                style={{
                                                    backgroundColor: '#64a19d',
                                                    letterSpacing: '1.2px',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 4px 10px rgba(100, 161, 157, 0.4)'
                                                }}
                                            >
                                                INGRESAR
                                            </button>
                                        </div>
                                    )}

                                    <div className="text-center mt-3 small" style={{ fontSize: '0.8rem' }}>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-white-50 text-decoration-none hover-white"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        )}
                                    </div>

                                    <div className="text-center mt-2 small" style={{ fontSize: '0.8rem' }}>
                                        <span className="text-white-50">¿No tienes cuenta? </span>
                                        <Link href={route('register')} className="text-decoration-underline text-white fw-semibold">
                                            Regístrate aquí
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <footer className="footer bg-black small text-center text-white-50 py-2">
                <div className="container px-3 px-lg-5" style={{ fontSize: '0.75rem' }}>Copyright &copy; CineReseñas 2026</div>
            </footer>
        </div>
    );
}