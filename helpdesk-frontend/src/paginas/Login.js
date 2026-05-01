import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import api from '../servicios/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();
    const navegar = useNavigate();

    const manejarLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const respuesta = await api.post('/auth/login', { email, password });
	    login(respuesta.data);
            navegar('/dashboard');
        } catch (error) {
            setError('Email o contraseña incorrectos');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={estilos.contenedor}>
            <div style={estilos.panel}>
                <div style={estilos.panelIzquierdo}>
                    <div style={estilos.logoContenedor}>
                        <span style={estilos.logoIcono}>HD</span>
                        <span style={estilos.logoTexto}>HelpDesk</span>
                    </div>
                    <h2 style={estilos.panelTitulo}>Gestiona incidencias de forma eficiente</h2>
                    <p style={estilos.panelSubtitulo}>Plataforma centralizada para el seguimiento y resolución de tickets de soporte.</p>
                    <div style={estilos.features}>
                        {['✅ Gestión de tickets en tiempo real', '✅ Sistema de roles y permisos', '✅ Seguimiento de incidencias', '✅ Panel de estadísticas'].map(f => (
                            <p key={f} style={estilos.feature}>{f}</p>
                        ))}
                    </div>
                </div>

                <div style={estilos.panelDerecho}>
                    <h2 style={estilos.titulo}>Iniciar Sesión</h2>
                    <p style={estilos.subtitulo}>Introduce tus credenciales para acceder</p>

                    {error && (
                        <div style={estilos.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={manejarLogin}>
                        <div style={estilos.campo}>
                            <label style={estilos.label}>Email</label>
                            <input
                                style={estilos.input}
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={estilos.campo}>
                            <label style={estilos.label}>Contraseña</label>
                            <input
                                style={estilos.input}
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button style={{ ...estilos.boton, opacity: cargando ? 0.7 : 1 }} type="submit" disabled={cargando}>
                            {cargando ? 'Accediendo...' : 'Acceder'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const estilos = {
    contenedor: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F5F8' },
    panel: { display: 'flex', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', width: '900px', maxWidth: '95vw' },
    panelIzquierdo: { backgroundColor: '#1A2B4A', padding: '50px 40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    logoContenedor: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' },
    logoIcono: { backgroundColor: '#2D6BE4', color: 'white', fontWeight: 'bold', fontSize: '16px', padding: '8px 12px', borderRadius: '8px' },
    logoTexto: { color: 'white', fontWeight: 'bold', fontSize: '22px' },
    panelTitulo: { color: 'white', fontSize: '22px', fontWeight: '600', marginBottom: '12px', lineHeight: '1.4' },
    panelSubtitulo: { color: '#A8B3C9', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' },
    features: { display: 'flex', flexDirection: 'column', gap: '10px' },
    feature: { color: '#A8B3C9', fontSize: '14px', margin: 0 },
    panelDerecho: { backgroundColor: 'white', padding: '50px 40px', width: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    titulo: { color: '#1A2B4A', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' },
    subtitulo: { color: '#6B778C', fontSize: '14px', margin: '0 0 30px 0' },
    error: { backgroundColor: '#FFEBEE', color: '#E53935', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', border: '1px solid #FFCDD2' },
    campo: { marginBottom: '20px' },
    label: { display: 'block', color: '#1A2B4A', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1A2B4A' },
    boton: { width: '100%', padding: '12px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }
};

export default Login;
