import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EditorDashboard({ auth }) {
    return (
        <AuthenticatedLayout auth={auth} title="Panel de Editor">
            {/* Masthead oficial de Grayscale para que la imagen abarque toda la pantalla */}
            <header className="masthead">
                <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
                    <div className="d-flex justify-content-center">
                        <div className="text-center">
                            <h1 className="mx-auto my-0 text-uppercase font-monospace" style={{ letterSpacing: '3px' }}>
                                Panel de Editor
                            </h1>
                            <h2 className="text-white-50 mx-auto mt-2 mb-5" style={{ fontSize: '1.25rem' }}>
                                Gestiona, redacta y modera las reseñas de la comunidad.
                            </h2>
                        </div>
                    </div>
                </div>
            </header>
        </AuthenticatedLayout>
    );
}