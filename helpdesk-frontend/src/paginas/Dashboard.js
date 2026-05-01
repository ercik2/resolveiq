import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../servicios/api';

const Dashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ abiertos: 0, en_progreso: 0, resueltos: 0 });
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const { usuario } = useAuth();
    const navegar = useNavigate();

    useEffect(() => {
	obtenerTickets();
	const intervalo = setInterval(obtenerTickets, 30000);
	return () => clearInterval(intervalo);
    }, []);

    const obtenerTickets = async () => {
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
            setEstadisticas({
                abiertos: res.data.filter(t => t.estado === 'abierto').length,
                en_progreso: res.data.filter(t => t.estado === 'en_progreso').length,
                resueltos: res.data.filter(t => t.estado === 'resuelto').length
            });
        } catch (error) {
            console.error('Error al obtener tickets', error);
        } finally {
            setCargando(false);
        }
    };

    const colorEstado = (estado) => ({ abierto: '#E53935', en_progreso: '#F59800', resuelto: '#36B37E' }[estado] || '#6B778C');
    const colorPrioridad = (p) => ({ alta: '#E53935', media: '#F59800', baja: '#36B37E' }[p] || '#6B778C');

    const ticketsFiltrados = tickets
        .filter(t => filtroEstado === 'todos' || t.estado === filtroEstado)
        .filter(t => filtroPrioridad === 'todos' || t.prioridad === filtroPrioridad)
        .filter(t => t.titulo.toLowerCase().includes(busqueda.toLowerCase()));

    const datosGrafico = [
        { name: 'Abiertos', value: estadisticas.abiertos },
        { name: 'En curso', value: estadisticas.en_progreso },
        { name: 'Resueltos', value: estadisticas.resueltos },
    ];

    const statItems = [
        { label: 'Total', valor: tickets.length, color: '#2D6BE4', filtro: 'todos' },
        { label: 'Abiertos', valor: estadisticas.abiertos, color: '#E53935', filtro: 'abierto' },
        { label: 'En Progreso', valor: estadisticas.en_progreso, color: '#F59800', filtro: 'en_progreso' },
        { label: 'Resueltos', valor: estadisticas.resueltos, color: '#36B37E', filtro: 'resuelto' },
    ];

    return (
        <div className="pagina-contenedor-ancho">
            <div style={estilos.cabeceraPagina}>
                <div>
                    <h1 style={estilos.titulo}>Tickets</h1>
                    <p style={estilos.subtitulo}>Gestiona y realiza seguimiento de incidencias</p>
                </div>
                {usuario?.rol === 'usuario' && (
                    <button style={estilos.botonCrear} onClick={() => navegar('/crear-ticket')}>
                        + Nuevo Ticket
                    </button>
                )}
            </div>

            <div style={estilos.dosColumnas}>
                <div style={{ ...estilos.tarjeta, flex: 2 }}>
                    <h2 style={estilos.seccionTitulo}>Distribución de Tickets</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={datosGrafico} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                                <Cell fill="#E53935" />
                                <Cell fill="#F59800" />
                                <Cell fill="#36B37E" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ ...estilos.tarjeta, flex: 1 }}>
                    <h2 style={estilos.seccionTitulo}>Resumen</h2>
                    {[
                        { label: 'Total tickets', valor: tickets.length, color: '#2D6BE4' },
                        { label: 'Sin agente', valor: tickets.filter(t => !t.agente_id).length, color: '#F59800' },
                        { label: 'Alta prioridad', valor: tickets.filter(t => t.prioridad === 'alta').length, color: '#E53935' },
                        { label: 'Resueltos', valor: estadisticas.resueltos, color: '#36B37E' },
                    ].map((item) => (
                        <div key={item.label} style={estilos.resumenItem}>
                            <span style={estilos.resumenLabel}>{item.label}</span>
                            <span style={{ ...estilos.resumenValor, color: item.color }}>{item.valor}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={estilos.tarjeta}>
                <div style={estilos.estadisticas}>
                    {statItems.map((stat) => (
                        <div key={stat.label}
                            style={{ ...estilos.tarjetaStat, borderTop: `3px solid ${stat.color}`, outline: filtroEstado === stat.filtro ? `2px solid ${stat.color}` : 'none' }}
                            onClick={() => setFiltroEstado(stat.filtro)}
                        >
                            <h3 style={{ ...estilos.statNumero, color: stat.color }}>{stat.valor}</h3>
                            <p style={estilos.statTexto}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div style={estilos.filtros}>
                    <input
                        style={estilos.buscador}
                        type="text"
                        placeholder="🔍 Buscar tickets..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <select style={estilos.select} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="todos">Todos los estados</option>
                        <option value="abierto">Abierto</option>
                        <option value="en_progreso">En curso</option>
                        <option value="resuelto">Resuelto</option>
                    </select>
                    <select style={estilos.select} value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
                        <option value="todos">Todas las prioridades</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                    </select>
                </div>

                {cargando ? (
                    <p style={{ color: '#6B778C', padding: '20px' }}>Cargando...</p>
                ) : ticketsFiltrados.length === 0 ? (
                    <p style={{ color: '#6B778C', padding: '20px' }}>No hay tickets disponibles</p>
                ) : (
                    <div className="tabla-responsive">
                        <table style={estilos.tabla}>
                            <thead>
                                <tr style={estilos.encabezadoTabla}>
                                    <th style={estilos.th}>ID</th>
                                    <th style={estilos.th}>Título</th>
                                    <th style={estilos.th}>Estado</th>
                                    <th style={estilos.th}>Prioridad</th>
                                    <th style={estilos.th}>Usuario</th>
                                    <th style={estilos.th}>Agente</th>
                                    <th style={estilos.th}>Fecha</th>
                                    <th style={estilos.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticketsFiltrados.map((ticket) => (
                                    <tr key={ticket.id} style={estilos.fila}>
                                        <td style={estilos.td}><span style={estilos.ticketId}>#{ticket.id}</span></td>
                                        <td style={estilos.td}>{ticket.titulo}</td>
                                        <td style={estilos.td}>
                                            <span style={{ ...estilos.badge, backgroundColor: colorEstado(ticket.estado) + '20', color: colorEstado(ticket.estado), border: `1px solid ${colorEstado(ticket.estado)}` }}>
                                                {ticket.estado === 'en_progreso' ? 'En curso' : ticket.estado}
                                            </span>
                                        </td>
                                        <td style={estilos.td}>
                                            <span style={{ ...estilos.badge, backgroundColor: colorPrioridad(ticket.prioridad) + '20', color: colorPrioridad(ticket.prioridad), border: `1px solid ${colorPrioridad(ticket.prioridad)}` }}>
                                                {ticket.prioridad}
                                            </span>
                                        </td>
                                        <td style={estilos.td}>{ticket.usuario_nombre}</td>
                                        <td style={estilos.td}>{ticket.agente_nombre || <span style={{ color: '#6B778C' }}>Sin asignar</span>}</td>
                                        <td style={estilos.td}><span style={{ color: '#6B778C', fontSize: '13px' }}>{new Date(ticket.created_at).toLocaleDateString()}</span></td>
                                        <td style={estilos.td}>
                                            <button style={estilos.botonVer} onClick={() => navegar(`/ticket/${ticket.id}`)}>Ver</button>
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
    botonCrear: { padding: '10px 20px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
    dosColumnas: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
    tarjeta: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '0px', overflow: 'hidden' },
    seccionTitulo: { fontSize: '16px', color: '#1A2B4A', fontWeight: '600', marginBottom: '16px', padding: '24px 24px 0 24px' },
    resumenItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #F3F5F8' },
    resumenLabel: { fontSize: '14px', color: '#6B778C' },
    resumenValor: { fontSize: '18px', fontWeight: '700' },
    estadisticas: { display: 'flex', gap: '0px', borderBottom: '1px solid #F3F5F8' },
    tarjetaStat: { flex: 1, padding: '20px 24px', cursor: 'pointer', borderRight: '1px solid #F3F5F8' },
    statNumero: { margin: 0, fontSize: '28px', fontWeight: '700' },
    statTexto: { margin: '4px 0 0 0', color: '#6B778C', fontSize: '13px' },
    filtros: { display: 'flex', gap: '12px', padding: '16px 24px', borderBottom: '1px solid #F3F5F8', flexWrap: 'wrap' },
    buscador: { flex: 1, minWidth: '200px', padding: '8px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', outline: 'none' },
    select: { padding: '8px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', color: '#1A2B4A', backgroundColor: 'white' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    encabezadoTabla: { backgroundColor: '#F8F9FB' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.5px' },
    fila: { borderBottom: '1px solid #F3F5F8' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#1A2B4A' },
    ticketId: { color: '#2D6BE4', fontWeight: '600' },
    badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
    botonVer: { padding: '6px 14px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
};

export default Dashboard;
