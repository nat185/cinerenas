import axios from 'axios';
import { router } from '@inertiajs/react';

/**
 * Sesión por pestaña + cierre por inactividad (todos los roles).
 * Importar UNA vez en resources/js/app.jsx:  import './tabSession';
 */

const CLAVE = 'tabSessionId';
const MINUTOS_INACTIVIDAD = 15;
const PING_CADA_MS = 4 * 60 * 1000;
const RUTAS_PUBLICAS = ['/', '/login', '/register', '/forgot-password'];

function nuevoId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'tab-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

function obtenerTabId() {
    try {
        let id = sessionStorage.getItem(CLAVE);
        if (!id) {
            id = nuevoId();
            sessionStorage.setItem(CLAVE, id);
        }
        return id;
    } catch (e) {
        return null;
    }
}

const tabId = obtenerTabId();

// 1) Cada petición lleva el identificador de ESTA pestaña
if (tabId) {
    axios.defaults.headers.common['X-Tab-Session'] = tabId;
    router.on('before', (event) => {
        event.detail.visit.headers['X-Tab-Session'] = tabId;
    });
}

// 2) Inactividad: sin mover el mouse, hacer clic o escribir durante 15 minutos -> login
let ultimaActividad = Date.now();
let ultimoPing = Date.now();
let actividadSinPing = false;
let cerrando = false;

const esPublica = () => {
    const ruta = window.location.pathname;
    return RUTAS_PUBLICAS.includes(ruta) || ruta.startsWith('/reset-password');
};

const registrarActividad = () => {
    ultimaActividad = Date.now();
    actividadSinPing = true;
};

['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach((evento) =>
    window.addEventListener(evento, registrarActividad, { passive: true })
);

function irAlLogin() {
    window.location.href = '/login';
}

function cerrarPorInactividad() {
    if (cerrando) return;
    cerrando = true;
    axios.post('/logout').then(irAlLogin, irAlLogin);
}

function revisar() {
    if (esPublica() || cerrando) return;

    const ahora = Date.now();

    if (ahora - ultimaActividad >= MINUTOS_INACTIVIDAD * 60 * 1000) {
        cerrarPorInactividad();
        return;
    }

    // Mientras el usuario se mueve, se avisa al servidor para que no venza su sesión
    if (actividadSinPing && ahora - ultimoPing >= PING_CADA_MS) {
        ultimoPing = ahora;
        actividadSinPing = false;
        axios.post('/session/ping').catch((error) => {
            if (error?.response?.status === 401) irAlLogin();
        });
    }
}

setInterval(revisar, 15000);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) revisar();
});