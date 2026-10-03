import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div id="page-top" className="bg-black text-white d-flex flex-column min-vh-100 justify-content-between">
            <Head>
                <title>Registrarse - CineReseñas</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
            </Head>

            {/* Navigation (Siempre transparente) */}
            <nav 
                className="navbar navbar-expand-lg fixed-top bg-transparent navbar-dark py-3" 
                id="mainNav"
                style={{ transition: 'all 0.3s ease-in-out' }}
            >
                <div className="container px-4 px-lg-5">
                    <Link 
                        className="navbar-brand text-uppercase fw-bold text-white" 
                        style={{ letterSpacing: '2px', transition: 'color 0.3s ease-in-out' }} 
                        href="/"
                    >
                        CineReseñas
                    </Link>
                </div>
            </nav>

            {/* Masthead */}
            <header className="masthead flex-grow-1 d-flex align-items-center justify-content-center pt-5 pb-5">
                <div className="container px-3 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center w-100">
                        <div className="text-center w-100" style={{ maxWidth: '580px' }}>
                            
                            {/* TÍTULO REGISTRARSE */}
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
                                Registrarse
                            </div>

                            <p 
                                className="text-white-50 mx-auto mb-3 small fw-light" 
                                style={{ letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                            >
                                Crea una cuenta para comenzar a calificar películas
                            </p>

                            {/* Tarjeta Glassmorphism */}
                            <div 
                                className="card text-white p-4 rounded-4 shadow-lg mx-auto" 
                                style={{ 
                                    backdropFilter: 'blur(12px)', 
                                    backgroundColor: 'rgba(15, 15, 15, 0.8)', 
                                    border: '1px solid rgba(255, 255, 255, 0.15)' 
                                }}
                            >
                                <form onSubmit={submit} className="text-start">
                                    <div className="mb-3">
                                        <InputLabel 
                                            htmlFor="name" 
                                            value="NOMBRE COMPLETO" 
                                            className="text-white-50 small mb-1 text-uppercase fw-semibold" 
                                            style={{ letterSpacing: '1px' }} 
                                        />

                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full form-control bg-dark text-white"
                                            style={{ 
                                                borderColor: '#64a19d', 
                                                boxShadow: '0 0 5px rgba(100, 161, 157, 0.3)' 
                                            }}
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />

                                        <InputError message={errors.name} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <InputLabel 
                                            htmlFor="email" 
                                            value="CORREO ELECTRÓNICO" 
                                            className="text-white-50 small mb-1 text-uppercase fw-semibold" 
                                            style={{ letterSpacing: '1px' }} 
                                        />

                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full form-control bg-dark text-white"
                                            style={{ 
                                                borderColor: '#64a19d', 
                                                boxShadow: '0 0 5px rgba(100, 161, 157, 0.3)' 
                                            }}
                                            autoComplete="username"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />

                                        <InputError message={errors.email} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <InputLabel 
                                            htmlFor="password" 
                                            value="CONTRASEÑA" 
                                            className="text-white-50 small mb-1 text-uppercase fw-semibold" 
                                            style={{ letterSpacing: '1px' }} 
                                        />

                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full form-control bg-dark text-white"
                                            style={{ 
                                                borderColor: '#64a19d', 
                                                boxShadow: '0 0 5px rgba(100, 161, 157, 0.3)' 
                                            }}
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />

                                        <InputError message={errors.password} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <InputLabel 
                                            htmlFor="password_confirmation" 
                                            value="CONFIRMAR CONTRASEÑA" 
                                            className="text-white-50 small mb-1 text-uppercase fw-semibold" 
                                            style={{ letterSpacing: '1px' }} 
                                        />

                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full form-control bg-dark text-white"
                                            style={{ 
                                                borderColor: '#64a19d', 
                                                boxShadow: '0 0 5px rgba(100, 161, 157, 0.3)' 
                                            }}
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />

                                        <InputError message={errors.password_confirmation} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="d-grid gap-2 mt-4">
                                        <button 
                                            type="submit" 
                                            className="btn text-uppercase w-100 justify-content-center py-2 fw-bold text-white border-0" 
                                            disabled={processing} 
                                            style={{ 
                                                backgroundColor: '#64a19d', 
                                                letterSpacing: '1.5px',
                                                boxShadow: '0 4px 10px rgba(100, 161, 157, 0.4)' 
                                            }}
                                        >
                                            CREAR CUENTA
                                        </button>
                                    </div>

                                    <div className="text-center mt-3 small">
                                        <span className="text-white-50">¿Ya tienes una cuenta? </span>
                                        <Link href={route('login')} className="text-decoration-underline text-white fw-semibold">
                                            Inicia sesión aquí
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Footer con Copyright */}
            <footer className="footer bg-transparent small text-center text-white-50 pb-4 pt-3">
                <div className="container px-3 px-lg-5" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                    Copyright &copy; CineReseñas 2026
                </div>
            </footer>
        </div>
    );
}

