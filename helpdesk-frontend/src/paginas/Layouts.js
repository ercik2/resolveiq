import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import './Layouts.css';

const Layouts = ({ children }) => {
    const { usuario, logout } = useAuth();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const manejarLogout = () => { logout(); navegar('/'); };

    const menuItems = [
        { ruta: '/dashboard', icono: '🗂️', texto: 'Tickets' },
        ...(usuario?.rol === 'usuario' ? [{ ruta: '/crear-ticket', icono: '➕', texto: 'Nuevo Ticket' }] : []),
        ...(usuario?.rol === 'admin' ? [{ ruta: '/admin', icono: '⚙️', texto: 'Administración' }] : []),
        { ruta: '/perfil', icono: '👤', texto: 'Mi Perfil' },
    ];

    const iniciales = usuario?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const navegarA = (ruta) => { navegar(ruta); setMenuAbierto(false); };

    return (
        <div className="layout-contenedor">
            <div className={`overlay ${menuAbierto ? 'overlay-activo' : ''}`} onClick={() => setMenuAbierto(false)} />

            <div className={`sidebar ${menuAbierto ? 'sidebar-abierto' : ''}`}>
                <div className="sidebar-logo">
                    <span className="logo-icono">HD</span>
                    <span className="logo-texto">HelpDesk</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.ruta}
                            className={`nav-item ${ubicacion.pathname === item.ruta ? 'nav-item-activo' : ''}`}
                            onClick={() => navegarA(item.ruta)}
                        >
                            <span>{item.icono}</span>
                            <span>{item.texto}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="avatar">{iniciales}</div>
                    <div className="usuario-info">
                        <span className="usuario-nombre">{usuario?.nombre}</span>
                        <span className="usuario-rol">{usuario?.rol}</span>
                    </div>
                    <button className="boton-logout" onClick={manejarLogout} title="Cerrar sesión">↪</button>
                </div>
            </div>

            <div className="cabecera-movil">
                <button className="hamburguesa" onClick={() => setMenuAbierto(!menuAbierto)}>☰</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="logo-icono">HD</span>
                    <span style={{ fontWeight: 'bold', color: '#1A2B4A' }}>HelpDesk</span>
                </div>
                <div className="avatar">{iniciales}</div>
            </div>

            <div className="contenido-principal">
                {children}
            </div>
        </div>
    );
};

export default Layouts;
