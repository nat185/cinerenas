import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { router } from '@inertiajs/react';

// Identificador único por PESTAÑA (sessionStorage NO se comparte entre pestañas,
// aunque sean del mismo navegador y mismo sitio — por eso es la pieza que faltaba)
function getTabSessionId() {
    let tabId = window.sessionStorage.getItem('tab_session_id');
    if (!tabId) {
        tabId = window.crypto?.randomUUID?.() ?? (Date.now() + '-' + Math.random().toString(36).slice(2));
        window.sessionStorage.setItem('tab_session_id', tabId);
    }
    return tabId;
}

// Agrega el identificador de esta pestaña a TODA petición que haga Inertia
// (incluido el login, porque useForm().post() internamente usa router)
router.on('before', (event) => {
    event.detail.visit.headers = {
        ...event.detail.visit.headers,
        'X-Tab-Session': getTabSessionId(),
    };
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
