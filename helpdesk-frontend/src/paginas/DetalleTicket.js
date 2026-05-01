import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContexto';
import ReactMarkdown from 'react-markdown';
import api from '../servicios/api';

const DetalleTicket = () => {
    const [ticket, setTicket] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [cargando, setCargando] = useState(true);
    const [analisisIa, setAnalisisIa] = useState(null);
    const [analizando, setAnalizando] = useState(false);
    const { usuario } = useAuth();
    const { id } = useParams();
    const navegar = useNavigate();

    useEffect(() => {
        obtenerDatos();
        const intervalo = setInterval(obtenerDatos, 15000);
        return () => clearInterval(intervalo);
    }, []);

    const obtenerDatos = async () => {
        try {
            const [resTicket, resComentarios, resAnalisis] = await Promise.all([
                api.get(`/tickets/${id}?t=${Date.now()}`),
                api.get(`/comentarios/${id}/comentarios?t=${Date.now()}`),
                api.get(`/ia/analisis/${id}`)
            ]);
            setTicket(resTicket.data);
            setComentarios(resComentarios.data);
            setAnalisisIa(resAnalisis.data.analisis);
        } catch (error) {
            console.error('Error al obtener datos', error);
        } finally {
            setCargando(false);
        }
    };

    const actualizarEstado = async (nuevoEstado) => {
        try {
            const agenteId = ticket.agente_id ? ticket.agente_id : (usuario.rol === 'agente' || usuario.rol === 'admin') ? usuario.id : null;
            await api.put(`/tickets/${id}`, {
                estado: nuevoEstado,
                prioridad: ticket.prioridad,
                agente_id: agenteId
            });
            obtenerDatos();
        } catch (error) {
            console.error('Error al actualizar estado', error);
        }
    };

    const enviarComentario = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/comentarios/${id}/comentarios`, { contenido: nuevoComentario });
            setNuevoComentario('');
            obtenerDatos();
        } catch (error) {
            console.error('Error al enviar comentario', error);
        }
    };

    const analizarConIa = async () => {
        setAnalizando(true);
        try {
            const res = await api.post(`/ia/analizar/${id}`);
            setAnalisisIa(res.data.analisis);
        } catch (error) {
            console.error('Error al analizar con IA', error);
        } finally {
            setAnalizando(false);
        }
    };

    const colorEstado = (estado) => ({ abierto: '#E53935', en_progreso: '#F59800', resuelto: '#36B37E' }[estado] || '#6B778C');
    const colorPrioridad = (p) => ({ alta: '#E53935', media: '#F59800', baja: '#36B37E' }[p] || '#6B778C');

    if (cargando) return <div style={{ padding: '40px', color: '#6B778C' }}>Cargando...</div>;
    if (!ticket) return <div style={{ padding: '40px', color: '#6B778C' }}>Ticket no encontrado</div>;

    return (
        <div className="pagina-contenedor">
            <div style={estilos.cabeceraPagina}>
                <button style={estilos.botonVolver} onClick={() => navegar('/dashboard')}>← Volver</button>
                <div>
                    <h1 style={estilos.titulo}>Ticket #{ticket.id}</h1>
                    <p style={estilos.subtitulo}>Creado el {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div style={estilos.tarjeta}>
                <h2 style={estilos.ticketTitulo}>{ticket.titulo}</h2>
                <p style={estilos.descripcion}>{ticket.descripcion}</p>

                <div style={estilos.metaGrid}>
                    <div style={estilos.metaItem}>
                        <span style={estilos.metaLabel}>Estado</span>
                        <span style={{ ...estilos.badge, backgroundColor: colorEstado(ticket.estado) + '20', color: colorEstado(ticket.estado), border: `1px solid ${colorEstado(ticket.estado)}` }}>
                            {ticket.estado === 'en_progreso' ? 'En curso' : ticket.estado}
                        </span>
                    </div>
                    <div style={estilos.metaItem}>
                        <span style={estilos.metaLabel}>Prioridad</span>
                        <span style={{ ...estilos.badge, backgroundColor: colorPrioridad(ticket.prioridad) + '20', color: colorPrioridad(ticket.prioridad), border: `1px solid ${colorPrioridad(ticket.prioridad)}` }}>
                            {ticket.prioridad}
                        </span>
                    </div>
                    <div style={estilos.metaItem}>
                        <span style={estilos.metaLabel}>Usuario</span>
                        <span style={estilos.metaValor}>{ticket.usuario_nombre}</span>
                    </div>
                    <div style={estilos.metaItem}>
                        <span style={estilos.metaLabel}>Agente</span>
                        <span style={estilos.metaValor}>{ticket.agente_nombre || 'Sin asignar'}</span>
                    </div>
                </div>

                {(usuario?.rol === 'agente' || usuario?.rol === 'admin') && (
                    <div style={estilos.accionesEstado}>
                        <p style={estilos.accionesLabel}>Cambiar estado:</p>
                        <div style={estilos.botonesEstado}>
                            {[
                                { estado: 'abierto', color: '#E53935', texto: 'Abierto' },
                                { estado: 'en_progreso', color: '#F59800', texto: 'En curso' },
                                { estado: 'resuelto', color: '#36B37E', texto: 'Resuelto' },
                            ].map((op) => (
                                <button
                                    key={op.estado}
                                    style={{
                                        ...estilos.botonEstado,
                                        backgroundColor: ticket.estado === op.estado ? op.color : 'white',
                                        color: ticket.estado === op.estado ? 'white' : op.color,
                                        border: `1px solid ${op.color}`
                                    }}
                                    onClick={() => actualizarEstado(op.estado)}
                                >
                                    {op.texto}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={estilos.tarjeta}>
                <h3 style={estilos.comentariosTitulo}>Comentarios ({comentarios.length})</h3>
                {comentarios.length === 0 ? (
                    <p style={{ color: '#6B778C', fontSize: '14px', marginBottom: '20px' }}>No hay comentarios aún.</p>
                ) : (
                    <div style={estilos.listaComentarios}>
                        {comentarios.map((comentario) => (
                            <div key={comentario.id} style={estilos.comentario}>
                                <div style={estilos.comentarioAvatar}>
                                    {comentario.usuario_nombre?.charAt(0).toUpperCase()}
                                </div>
                                <div style={estilos.comentarioContenido}>
                                    <div style={estilos.comentarioCabecera}>
                                        <strong style={estilos.comentarioAutor}>{comentario.usuario_nombre}</strong>
                                        <span style={estilos.comentarioFecha}>{new Date(comentario.created_at).toLocaleString()}</span>
                                    </div>
                                    <p style={estilos.comentarioTexto}>{comentario.contenido}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={enviarComentario} style={estilos.formularioComentario}>
                    <textarea
                        style={estilos.inputComentario}
                        placeholder="Escribe un comentario..."
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        required
                    />
                    <button type="submit" style={estilos.botonEnviar}>Enviar Comentario</button>
                </form>
            </div>

            {(usuario?.rol === 'agente' || usuario?.rol === 'admin') && (
                <div style={estilos.tarjeta}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={estilos.comentariosTitulo}>🤖 Análisis IA</h3>
                        <button
                            style={{ ...estilos.botonEnviar, opacity: analizando ? 0.7 : 1 }}
                            onClick={analizarConIa}
                            disabled={analizando}
                        >
                            {analizando ? 'Analizando...' : 'Generar Análisis'}
                        </button>
                    </div>
                    {analisisIa ? (
                        <div style={estilos.analisisContenido}>
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 style={{fontSize: '18px', color: '#1A2B4A', marginBottom: '12px'}} {...props} />,
                                    h2: ({node, ...props}) => <h2 style={{fontSize: '16px', color: '#1A2B4A', marginBottom: '10px', marginTop: '16px'}} {...props} />,
                                    h3: ({node, ...props}) => <h3 style={{fontSize: '14px', color: '#1A2B4A', marginBottom: '8px', marginTop: '12px'}} {...props} />,
                                    p: ({node, ...props}) => <p style={{fontSize: '14px', color: '#6B778C', lineHeight: '1.7', marginBottom: '8px'}} {...props} />,
                                    ul: ({node, ...props}) => <ul style={{paddingLeft: '20px', marginBottom: '8px'}} {...props} />,
                                    ol: ({node, ...props}) => <ol style={{paddingLeft: '20px', marginBottom: '8px'}} {...props} />,
                                    li: ({node, ...props}) => <li style={{fontSize: '14px', color: '#6B778C', lineHeight: '1.7', marginBottom: '4px'}} {...props} />,
                                    strong: ({node, ...props}) => <strong style={{color: '#1A2B4A', fontWeight: '600'}} {...props} />,
                                    code: ({node, ...props}) => <code style={{backgroundColor: '#F3F5F8', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: '#2D6BE4'}} {...props} />,
                                }}
                            >
                                {analisisIa}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <p style={{ color: '#6B778C', fontSize: '14px' }}>
                            Genera un análisis automático de esta incidencia con IA.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const estilos = {
    cabeceraPagina: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
    botonVolver: { padding: '8px 16px', backgroundColor: 'white', color: '#1A2B4A', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    titulo: { margin: 0, fontSize: '24px', color: '#1A2B4A', fontWeight: '600' },
    subtitulo: { margin: '4px 0 0 0', color: '#6B778C', fontSize: '14px' },
    tarjeta: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '20px' },
    ticketTitulo: { fontSize: '18px', color: '#1A2B4A', fontWeight: '600', marginBottom: '12px' },
    descripcion: { color: '#6B778C', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' },
    metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', padding: '20px 0', borderTop: '1px solid #F3F5F8', borderBottom: '1px solid #F3F5F8' },
    metaItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    metaLabel: { fontSize: '11px', fontWeight: '600', color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.5px' },
    metaValor: { fontSize: '14px', color: '#1A2B4A', fontWeight: '500' },
    badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', display: 'inline-block' },
    accionesEstado: { marginTop: '20px' },
    accionesLabel: { fontSize: '13px', fontWeight: '600', color: '#1A2B4A', marginBottom: '10px' },
    botonesEstado: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    botonEstado: { padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
    comentariosTitulo: { fontSize: '16px', color: '#1A2B4A', fontWeight: '600', marginBottom: '20px' },
    listaComentarios: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
    comentario: { display: 'flex', gap: '12px' },
    comentarioAvatar: { width: '36px', height: '36px', backgroundColor: '#2D6BE4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 },
    comentarioContenido: { flex: 1, backgroundColor: '#F8F9FB', borderRadius: '8px', padding: '12px 16px' },
    comentarioCabecera: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' },
    comentarioAutor: { fontSize: '13px', color: '#1A2B4A' },
    comentarioFecha: { fontSize: '12px', color: '#6B778C' },
    comentarioTexto: { fontSize: '14px', color: '#1A2B4A', margin: 0, lineHeight: '1.6' },
    formularioComentario: { borderTop: '1px solid #F3F5F8', paddingTop: '20px' },
    inputComentario: { width: '100%', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', height: '100px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '12px' },
    botonEnviar: { padding: '10px 24px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    analisisContenido: { backgroundColor: '#F8F9FB', borderRadius: '8px', padding: '20px' }
};

export default DetalleTicket;
