import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import api from '../servicios/api';

const Perfil = () => {
    const { usuario } = useAuth();
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNuevo, setPasswordNuevo] = useState('');
    const [passwordConfirmar, setPasswordConfirmar] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(false);
    const [statsAgente, setStatsAgente] = useState(null);

    const iniciales = usuario?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colorRol = { admin: '#722ed1', agente: '#2D6BE4', usuario: '#36B37E' }[usuario?.rol] || '#6B778C';

    useEffect(() => {
        if (usuario?.rol === 'agente' || usuario?.rol === 'admin') {
            obtenerStatsAgente();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const obtenerStatsAgente = async () => {
        try {
            const res = await api.get('/tickets/estadisticas-agente');
            setStatsAgente(res.data);
        } catch (error) {
            console.error('Error al obtener estadísticas', error);
        }
    };

    const cambiarPassword = async (e) => {
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
            await api.put('/auth/cambiar-password', { passwordActual, passwordNuevo });
            setExito('Contraseña cambiada correctamente');
            setError('');
            setPasswordActual('');
            setPasswordNuevo('');
            setPasswordConfirmar('');
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error al cambiar la contraseña');
            setExito('');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pagina-contenedor">
            <div style={estilos.cabeceraPagina}>
                <h1 style={estilos.titulo}>Mi Perfil</h1>
                <p style={estilos.subtitulo}>Gestiona tu información personal</p>
            </div>

            <div style={estilos.tarjeta}>
                <div style={estilos.perfilCabecera}>
                    <div style={estilos.avatarGrande}>{iniciales}</div>
                    <div>
                        <h2 style={estilos.perfilNombre}>{usuario?.nombre}</h2>
                        <p style={estilos.perfilEmail}>{usuario?.email}</p>
                        <span style={{ ...estilos.badge, backgroundColor: colorRol + '20', color: colorRol, border: `1px solid ${colorRol}` }}>
                            {usuario?.rol}
                        </span>
                    </div>
                </div>
            </div>

            {statsAgente && (
                <div style={estilos.tarjeta}>
                    <h2 style={estilos.seccionTitulo}>Mis Estadísticas</h2>
                    <div style={estilos.statsGrid}>
                        {[
                            { label: 'Total asignados', valor: statsAgente.total_asignados, color: '#2D6BE4' },
                            { label: 'Resueltos', valor: statsAgente.resueltos, color: '#36B37E' },
                            { label: 'En progreso', valor: statsAgente.en_progreso, color: '#F59800' },
                            { label: 'Pendientes', valor: statsAgente.abiertos, color: '#E53935' },
                        ].map((stat) => (
                            <div key={stat.label} style={{ ...estilos.statTarjeta, borderTop: `3px solid ${stat.color}` }}>
                                <h3 style={{ ...estilos.statNumero, color: stat.color }}>{stat.valor}</h3>
                                <p style={estilos.statTexto}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div style={estilos.progreso}>
                        <div style={estilos.progresoInfo}>
                            <span style={estilos.progresoLabel}>Tasa de resolución</span>
                            <span style={estilos.progresoValor}>
                                {statsAgente.total_asignados > 0
                                    ? Math.round((statsAgente.resueltos / statsAgente.total_asignados) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div style={estilos.progresoBarra}>
                            <div style={{
                                ...estilos.progresoRelleno,
                                width: `${statsAgente.total_asignados > 0 ? Math.round((statsAgente.resueltos / statsAgente.total_asignados) * 100) : 0}%`
                            }} />
                        </div>
                    </div>
                </div>
            )}

            <div style={estilos.tarjeta}>
                <h2 style={estilos.seccionTitulo}>Cambiar Contraseña</h2>
                {error && <div style={estilos.error}>⚠️ {error}</div>}
                {exito && <div style={estilos.exito}>✅ {exito}</div>}
                <form onSubmit={cambiarPassword}>
                    <div style={estilos.campo}>
                        <label style={estilos.label}>Contraseña actual</label>
                        <input style={estilos.input} type="password" placeholder="••••••••"
                            value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} required />
                    </div>
                    <div style={estilos.campo}>
                        <label style={estilos.label}>Nueva contraseña</label>
                        <input style={estilos.input} type="password" placeholder="••••••••"
                            value={passwordNuevo} onChange={(e) => setPasswordNuevo(e.target.value)} required />
                    </div>
                    <div style={estilos.campo}>
                        <label style={estilos.label}>Confirmar nueva contraseña</label>
                        <input style={estilos.input} type="password" placeholder="••••••••"
                            value={passwordConfirmar} onChange={(e) => setPasswordConfirmar(e.target.value)} required />
                    </div>
                    <button type="submit" style={{ ...estilos.botonGuardar, opacity: cargando ? 0.7 : 1 }} disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const estilos = {
    cabeceraPagina: { marginBottom: '24px' },
    titulo: { margin: 0, fontSize: '24px', color: '#1A2B4A', fontWeight: '600' },
    subtitulo: { margin: '4px 0 0 0', color: '#6B778C', fontSize: '14px' },
    tarjeta: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '20px' },
    perfilCabecera: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    avatarGrande: { width: '72px', height: '72px', backgroundColor: '#2D6BE4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 },
    perfilNombre: { margin: '0 0 4px 0', fontSize: '20px', color: '#1A2B4A', fontWeight: '600' },
    perfilEmail: { margin: '0 0 8px 0', color: '#6B778C', fontSize: '14px' },
    badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
    seccionTitulo: { fontSize: '16px', color: '#1A2B4A', fontWeight: '600', marginBottom: '20px' },
    statsGrid: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
    statTarjeta: { flex: 1, minWidth: '120px', backgroundColor: '#F8F9FB', padding: '16px', borderRadius: '8px' },
    statNumero: { margin: 0, fontSize: '28px', fontWeight: '700' },
    statTexto: { margin: '4px 0 0 0', color: '#6B778C', fontSize: '13px' },
    progreso: { backgroundColor: '#F8F9FB', padding: '16px', borderRadius: '8px' },
    progresoInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    progresoLabel: { fontSize: '14px', color: '#6B778C' },
    progresoValor: { fontSize: '14px', fontWeight: '600', color: '#1A2B4A' },
    progresoBarra: { backgroundColor: '#DFE1E6', borderRadius: '4px', height: '8px' },
    progresoRelleno: { backgroundColor: '#36B37E', borderRadius: '4px', height: '8px', transition: 'width 0.3s ease' },
    error: { backgroundColor: '#FFEBEE', color: '#E53935', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #FFCDD2' },
    exito: { backgroundColor: '#E8F5E9', color: '#36B37E', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #C8E6C9' },
    campo: { marginBottom: '20px' },
    label: { display: 'block', color: '#1A2B4A', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
    botonGuardar: { padding: '10px 24px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }
};

export default Perfil;
