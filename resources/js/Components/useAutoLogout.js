import { useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function useAutoLogout(timeoutInMinutes = 15) {
    const { auth } = usePage().props;
    const timerRef = useRef(null);
    const timeoutMs = timeoutInMinutes * 60 * 1000;

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);

        // Inicia la cuenta regresiva para cerrar sesión si hay un usuario autenticado
        if (auth?.user) {
            timerRef.current = setTimeout(() => {
                // Hacer logout automático mediante Inertia
                router.post(route('logout'));
            }, timeoutMs);
        }
    };

    useEffect(() => {
        // Solo activar la escucha si el usuario inició sesión
        if (!auth?.user) return;

        // Lista de eventos que cuentan como "actividad"
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

        // Escuchar eventos para reiniciar el temporizador
        events.forEach((event) => window.addEventListener(event, resetTimer));

        // Iniciar el temporizador por primera vez
        resetTimer();

        // Limpiar eventos al desmontar
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [auth?.user]);
}