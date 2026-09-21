import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
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
        <div id="page-top" className="bg-black text-white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Head title="Registro - CineReseñas" />

            {/* Navigation / Barra de Navegación Grayscale */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
                <div className="container px-4 px-lg-5">
                    <Link className="navbar-brand text-uppercase fw-bold" style={{ letterSpacing: '2px' }} href="/">
                        CineReseñas
                    </Link>
                </div>
            </nav>

            {/* Masthead / Fondo Grayscale con el Formulario Subido */}
            <header className="masthead" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6.5rem', paddingBottom: '3rem' }}>
                <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center w-100">
                        <div className="text-center w-100" style={{ maxWidth: '650px' }}>
                            {/* TÍTULO AMPLIADO A LO LARGO */}
                            <h1 className="mx-auto my-0 text-uppercase fw-normal w-100" style={{ fontSize: '3.5rem', letterSpacing: '0.35rem', fontFamily: "'Varela Round', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", whiteSpace: 'nowrap' }}>
                                REGISTRO
                            </h1>
                            <h2 className="text-white-50 mx-auto mt-2 mb-3" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>
                                Crea una nueva cuenta en CineReseñas
                            </h2>

                            {/* Tarjeta con Estilo Vidrio (Glassmorphism) Compacta */}
                            <div className="card text-white p-3 p-md-4 rounded-4 shadow-lg" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 15, 15, 0.65)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
                                <form onSubmit={submit} className="text-start">
                                    <div className="mb-2">
                                        <InputLabel htmlFor="name" value="NOMBRE COMPLETO" className="text-white-50 small mb-1 text-uppercase" style={{ letterSpacing: '1px' }} />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full form-control bg-dark text-white border-secondary"
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        <InputError message={errors.name} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-2">
                                        <InputLabel htmlFor="email" value="CORREO ELECTRÓNICO" className="text-white-50 small mb-1 text-uppercase" style={{ letterSpacing: '1px' }} />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full form-control bg-dark text-white border-secondary"
                                            autoComplete="username"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-2">
                                        <InputLabel htmlFor="password" value="CONTRASEÑA" className="text-white-50 small mb-1 text-uppercase" style={{ letterSpacing: '1px' }} />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full form-control bg-dark text-white border-secondary"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <InputError message={errors.password} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <InputLabel htmlFor="password_confirmation" value="CONFIRMAR CONTRASEÑA" className="text-white-50 small mb-1 text-uppercase" style={{ letterSpacing: '1px' }} />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full form-control bg-dark text-white border-secondary"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                        <InputError message={errors.password_confirmation} className="mt-1 text-danger small" />
                                    </div>

                                    <div className="d-grid gap-2 mt-3">
                                        <PrimaryButton className="btn btn-primary text-uppercase w-100 justify-content-center py-2" disabled={processing} style={{ letterSpacing: '1px' }}>
                                            Registrarse
                                        </PrimaryButton>
                                    </div>

                                    <div className="text-center mt-3 small">
                                        <span className="text-white-50">¿Ya tienes cuenta? </span>
                                        <Link href={route('login')} className="text-decoration-underline text-white">
                                            Inicia sesión
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Footer */}
            <footer className="footer bg-black small text-center text-white-50 py-3">
                <div className="container px-4 px-lg-5">Copyright &copy; CineReseñas 2026</div>
            </footer>
        </div>
    );
}