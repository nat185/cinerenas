import React from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div id="page-top" className="bg-black text-white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Head title="Iniciar Sesión - CineReseñas" />

            {/* Navigation / Barra de Navegación Grayscale */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
                <div className="container px-4 px-lg-5">
                    <Link className="navbar-brand text-uppercase fw-bold" style={{ letterSpacing: '2px' }} href="/">
                        CineReseñas
                    </Link>
                </div>
            </nav>

            {/* Masthead / Fondo Grayscale con el Formulario Estilizado */}
            <header className="masthead" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '9rem', paddingBottom: '4rem' }}>
                <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center w-100">
                        <div className="text-center w-100" style={{ maxWidth: '650px' }}>
                            {/* TÍTULO AMPLIADO A LO LARGO */}
                            <h1 className="mx-auto my-0 text-uppercase fw-normal w-100" style={{ fontSize: '3.5rem', letterSpacing: '0.35rem', fontFamily: "'Varela Round', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", whiteSpace: 'nowrap' }}>
                                INICIAR SESIÓN
                            </h1>
                            <h2 className="text-white-50 mx-auto mt-3 mb-4" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>
                                Accede a tu cuenta de CineReseñas
                            </h2>

                            {status && (
                                <div className="mb-4 text-sm font-medium text-success">
                                    {status}
                                </div>
                            )}

                            {/* Tarjeta con Estilo Vidrio (Glassmorphism) */}
                            <div className="card text-white p-4 rounded-4 shadow-lg" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 15, 15, 0.65)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
                                <form onSubmit={submit} className="text-start">
                                    <div className="mb-3">
                                        <InputLabel htmlFor="email" value="CORREO ELECTRÓNICO" className="text-white-50 small mb-1 text-uppercase" style={{ letterSpacing: '1px' }} />

                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full form-control bg-dark text-white border-secondary"
                                            autoComplete="username"
                                            isFocused={true}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />

                                        <InputError message={errors.email} className="mt-2 text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <InputLabel htmlFor="password" value="CONTRASEÑA" className="text-white-50 small mb-1 text-uppercase" style={{ letterSpacing: '1px' }} />

                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full form-control bg-dark text-white border-secondary"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />

                                        <InputError message={errors.password} className="mt-2 text-danger small" />
                                    </div>

                                    <div className="mb-3 form-check small">
                                        <label className="flex items-center text-white-50 small">
                                            <Checkbox
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="bg-dark border-secondary"
                                            />
                                            <span className="ms-2">Recordar sesión</span>
                                        </label>
                                    </div>

                                    <div className="d-grid gap-2 mt-4">
                                        <PrimaryButton className="btn btn-primary text-uppercase w-100 justify-content-center py-2" disabled={processing} style={{ letterSpacing: '1px' }}>
                                            Ingresar
                                        </PrimaryButton>
                                    </div>

                                    <div className="text-center mt-3 small">
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-white-50 text-decoration-none"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        )}
                                    </div>

                                    <div className="text-center mt-2 small">
                                        <span className="text-white-50">¿No tienes cuenta? </span>
                                        <Link href={route('register')} className="text-decoration-underline text-white">
                                            Regístrate aquí
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Footer sin línea superior */}
            <footer className="footer bg-black small text-center text-white-50 py-4">
                <div className="container px-4 px-lg-5">Copyright &copy; CineReseñas 2026</div>
            </footer>
        </div>
    );
}