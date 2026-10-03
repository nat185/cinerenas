import React, { useState, useEffect } from 'react';

export default function MiPlantillaLayout({ children }) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div id="page-top" style={{ position: 'relative' }}>
            {/* Se elimina completamente el elemento nav superior */}
            
            <main>{children}</main>



            {/* Footer sencillo */}
            <footer className="footer bg-black py-4 border-top border-secondary border-opacity-25 small text-center text-white-50">
                <div className="container px-4 px-lg-5">
                    <div className="mb-1">Tu espacio cinematográfico</div>
                    <div>Copyright &copy; {new Date().getFullYear()} — Todos los derechos reservados.</div>
                </div>
            </footer>
        </div>
    );
       
}

