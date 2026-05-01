import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import api from '../servicios/api';

const AdminPanel = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', rol: 'usuario' });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const { usuario } = useAuth();
    const navegar = useNavigate();

    useEffect(() => {
        if (usuario?.rol !== 'admin') navegar('/dashboard');
        obtenerUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const obtenerUsuarios = async () => {
        try {
            const res = await api.get('/auth/usuarios');
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error al obtener usuarios', error);
        } finally {
            setCargando(false);
        }
    };

    const crearUsuario = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/registro', nuevoUsuario);
            setExito('Usuario creado correctamente');
            setError('');
            setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'usuario' });
            obtenerUsuarios();
        } catch (error) {
            setError('Error al crear usuario');
            setExito('');
        }
    };

    const eliminarUsuario = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await api.delete(`/auth/usuarios/${id}`);
            obtenerUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario', error);
        }
    };

    const colorRol = (rol) => ({ admin: '#722ed1', agente: '#2D6BE4', usuario: '#36B37E' }[rol] || '#6B778C');

    return (
        <div className="pagina-contenedor-ancho">
            <div style={estilos.cabeceraPagina}>
                <div>
                    <h1 style={estilos.titulo}>Administración</h1>
                    <p style={estilos.subtitulo}>Gestiona los usuarios de la plataforma</p>
                </div>
            </div>

            <div style={estilos.tarjeta}>
                <h2 style={estilos.seccionTitulo}>Crear Usuario</h2>
                {error && <div style={estilos.error}>⚠️ {error}</div>}
                {exito && <div style={estilos.exito}>✅ {exito}</div>}
                <form onSubmit={crearUsuario}>
                    <div style={estilos.formularioFila}>
                        <input style={estilos.input} type="text" placeholder="Nombre" value={nuevoUsuario.nombre}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} required />
                        <input style={estilos.input} type="email" placeholder="Email" value={nuevoUsuario.email}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} required />
                        <input style={estilos.input} type="password" placeholder="Contraseña" value={nuevoUsuario.password}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} required />
                        <select style={estilos.input} value={nuevoUsuario.rol}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
                            <option value="usuario">Usuario</option>
                            <option value="agente">Agente</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" style={estilos.botonCrear}>+ Crear</button>
                    </div>
                </form>
            </div>

            <div style={estilos.tarjeta}>
                <h2 style={estilos.seccionTitulo}>Usuarios ({usuarios.length})</h2>
                {cargando ? (
                    <p style={{ color: '#6B778C', padding: '20px 0' }}>Cargando...</p>
                ) : (
                    <div className="tabla-responsive">
                        <table style={estilos.tabla}>
                            <thead>
                                <tr style={estilos.encabezadoTabla}>
                                    <th style={estilos.th}>ID</th>
                                    <th style={estilos.th}>Nombre</th>
                                    <th style={estilos.th}>Email</th>
                                    <th style={estilos.th}>Rol</th>
                                    <th style={estilos.th}>Creado</th>
                                    <th style={estilos.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.id} style={estilos.fila}>
                                        <td style={estilos.td}><span style={estilos.userId}>#{u.id}</span></td>
                                        <td style={estilos.td}>{u.nombre}</td>
                                        <td style={estilos.td}><span style={{ color: '#6B778C' }}>{u.email}</span></td>
                                        <td style={estilos.td}>
                                            <span style={{ ...estilos.badge, backgroundColor: colorRol(u.rol) + '20', color: colorRol(u.rol), border: `1px solid ${colorRol(u.rol)}` }}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td style={estilos.td}><span style={{ color: '#6B778C', fontSize: '13px' }}>{new Date(u.created_at).toLocaleDateString()}</span></td>
                                        <td style={estilos.td}>
                                            {u.id !== usuario.id && (
                                                <button style={estilos.botonEliminar} onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const estilos = {
    cabeceraPagina: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    titulo: { margin: 0, fontSize: '24px', color: '#1A2B4A', fontWeight: '600' },
    subtitulo: { margin: '4px 0 0 0', color: '#6B778C', fontSize: '14px' },
    tarjeta: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '20px' },
    seccionTitulo: { fontSize: '16px', color: '#1A2B4A', fontWeight: '600', marginBottom: '16px' },
    error: { backgroundColor: '#FFEBEE', color: '#E53935', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #FFCDD2' },
    exito: { backgroundColor: '#E8F5E9', color: '#36B37E', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #C8E6C9' },
    formularioFila: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    input: { padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', flex: 1, minWidth: '150px', outline: 'none' },
    botonCrear: { padding: '10px 20px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    encabezadoTabla: { backgroundColor: '#F8F9FB' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.5px' },
    fila: { borderBottom: '1px solid #F3F5F8' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#1A2B4A' },
    userId: { color: '#2D6BE4', fontWeight: '600' },
    badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
    botonEliminar: { padding: '6px 14px', backgroundColor: '#FFEBEE', color: '#E53935', border: '1px solid #FFCDD2', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }
};

export default AdminPanel;
