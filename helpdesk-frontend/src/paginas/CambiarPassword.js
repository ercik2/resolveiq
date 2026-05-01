import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import api from '../servicios/api';

const CambiarPassword = () => {
    const [passwordNuevo, setPasswordNuevo] = useState('');
    const [passwordConfirmar, setPasswordConfirmar] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const { usuario, actualizarPrimerLogin } = useAuth();
    const navegar = useNavigate();

    const manejarEnvio = async (e) => {
        e.preventDefault();
        if (passwordNuevo !== passwordConfirmar) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (passwordNuevo.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setCargando(true);
        try {
            await api.put('/auth/cambiar-password', {
                passwordNuevo,
                esPrimerLogin: true
            });
            actualizarPrimerLogin();
            navegar('/dashboard');
        } catch (error) {
            setError('Error al cambiar la contraseña');
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
                    <h2 style={estilos.panelTitulo}>Bienvenido/a, {usuario?.nombre}</h2>
                    <p style={estilos.panelSubtitulo}>Por seguridad, debes cambiar tu contraseña antes de continuar.</p>
                    <div style={estilos.requisitos}>
                        <p style={estilos.requisitosTitulo}>Requisitos:</p>
                        <p style={estilos.requisito}>✅ Mínimo 6 caracteres</p>
                        <p style={estilos.requisito}>✅ Diferente a la contraseña temporal</p>
                    </div>
                </div>
                <div style={estilos.panelDerecho}>
                    <h2 style={estilos.titulo}>Cambiar Contraseña</h2>
                    <p style={estilos.subtitulo}>Establece tu nueva contraseña de acceso</p>
                    {error && <div style={estilos.error}>⚠️ {error}</div>}
                    <form onSubmit={manejarEnvio}>
                        <div style={estilos.campo}>
                            <label style={estilos.label}>Nueva contraseña</label>
                            <input style={estilos.input} type="password" placeholder="••••••••"
                                value={passwordNuevo} onChange={(e) => setPasswordNuevo(e.target.value)} required />
                        </div>
                        <div style={estilos.campo}>
                            <label style={estilos.label}>Confirmar contraseña</label>
                            <input style={estilos.input} type="password" placeholder="••••••••"
                                value={passwordConfirmar} onChange={(e) => setPasswordConfirmar(e.target.value)} required />
                        </div>
                        <button style={{ ...estilos.boton, opacity: cargando ? 0.7 : 1 }} type="submit" disabled={cargando}>
                            {cargando ? 'Guardando...' : 'Establecer Contraseña'}
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
    panelTitulo: { color: 'white', fontSize: '22px', fontWeight: '600', marginBottom: '12px' },
    panelSubtitulo: { color: '#A8B3C9', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' },
    requisitos: { backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' },
    requisitosTitulo: { color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '10px' },
    requisito: { color: '#A8B3C9', fontSize: '13px', marginBottom: '6px' },
    panelDerecho: { backgroundColor: 'white', padding: '50px 40px', width: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    titulo: { color: '#1A2B4A', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' },
    subtitulo: { color: '#6B778C', fontSize: '14px', margin: '0 0 30px 0' },
    error: { backgroundColor: '#FFEBEE', color: '#E53935', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', border: '1px solid #FFCDD2' },
    campo: { marginBottom: '20px' },
    label: { display: 'block', color: '#1A2B4A', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
    boton: { width: '100%', padding: '12px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
};

export default CambiarPassword;
