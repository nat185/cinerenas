import React, { useState } from 'react';

export function MiniBarChart({ data }) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div
            className="d-flex align-items-end gap-3"
            style={{ height: '120px' }}
        >
            {data.map((d) => (
                <div
                    key={d.label}
                    className="d-flex flex-column align-items-center flex-fill"
                    style={{ height: '100%' }}
                >
                    <div
                        className="w-100 rounded-top bg-primary"
                        style={{
                            height: `${(d.value / max) * 100}%`,
                            marginTop: 'auto',
                            opacity: 0.85,
                        }}
                        title={`${d.label}: ${d.value}`}
                    ></div>

                    <span
                        className="text-muted mt-2"
                        style={{ fontSize: '0.8rem' }}
                    >
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function KpiCard({ label, value }) {
    return (
        <div className="col-6 col-md-4 col-lg-2">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center border-top border-3 border-primary rounded-top py-4">
                    <h6
                        className="font-heading text-uppercase text-muted mb-2"
                        style={{ fontSize: '0.75rem' }}
                    >
                        {label}
                    </h6>

                    <h2 className="font-heading text-dark mb-0 fw-bold">
                        {value}
                    </h2>
                </div>
            </div>
        </div>
    );
}

export function PosterThumb({ src, alt, size = 56 }) {
    const [broken, setBroken] = useState(!src);

    if (broken) {
        return (
            <div
                className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-25 rounded"
                style={{
                    width: size,
                    height: size * 1.4,
                    flexShrink: 0,
                }}
            >
                <i className="fas fa-film text-white-50"></i>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="rounded"
            style={{
                width: size,
                height: size * 1.4,
                objectFit: 'cover',
                flexShrink: 0,
            }}
            onError={() => setBroken(true)}
        />
    );
}

export function PageHeader({ title, subtitle, action }) {
    return (
        <div
            className="d-flex flex-wrap justify-content-between align-items-center py-4 px-4 px-lg-5"
            style={{
                marginTop: '64px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e9ecef',
            }}
        >
            <div>
                <h1
                    className="font-heading fw-bold mb-1"
                    style={{
                        fontSize: '1.6rem',
                        color: '#212529',
                    }}
                >
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-muted mb-0">
                        {subtitle}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}

export function StatusBadge({ status }) {
    const map = {
        Publicada: 'success',
        Borrador: 'secondary',
        Archivada: 'dark',
        Visible: 'success',
        Oculto: 'secondary',
        'En revisión': 'warning',
        Activo: 'success',
        Inactivo: 'secondary',
        Pendiente: 'warning',
        Revisado: 'info',
        Aprobado: 'success',
        Eliminado: 'danger',
    };

    return (
        <span className={`badge bg-${map[status] || 'secondary'}`}>
            {status}
        </span>
    );
}