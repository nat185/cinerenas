import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function GuestLayout({ title, children }) {
    return (
        <div className="bg-black text-white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head title={title} />
            
            {/* Navbar limpio solo con el logo para páginas de acceso */}
            <nav className="navbar navbar-dark bg-black fixed-top border-bottom border-secondary py-3">
                <div className="container px-4 px-lg-5">
                    <Link className="navbar-brand text-uppercase fw-bold font-monospace" href="/">
                        CineReseñas
                    </Link>
                </div>
            </nav>

            <main className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ marginTop: '5rem' }}>
                <div className="container px-4 px-lg-5 py-5" style={{ maxWidth: '600px' }}>
                    {children}
                </div>
            </main>

            <footer className="footer bg-black small text-center text-white-50 py-4 border-top border-secondary">
                <div className="container px-4 px-lg-5">Copyright &copy; CineReseñas 2026</div>
            </footer>
        </div>
    );
}