import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../servicios/api';

const CrearTicket = () => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [prioridad, setPrioridad] = useState('media');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navegar = useNavigate();

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            await api.post('/tickets', { titulo, descripcion, prioridad });
            navegar('/dashboard');
        } catch (error) {
            setError('Error al crear el ticket');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pagina-contenedor">
            <div style={estilos.cabeceraPagina}>
                <div>
                    <h1 style={estilos.titulo}>Nuevo Ticket</h1>
                    <p style={estilos.subtitulo}>Describe tu incidencia con el mayor detalle posible</p>
                </div>
            </div>

            <div style={estilos.tarjeta}>
                {error && <div style={estilos.error}>⚠️ {error}</div>}
                <form onSubmit={manejarEnvio}>
                    <div style={estilos.campo}>
                        <label style={estilos.label}>Título <span style={estilos.requerido}>*</span></label>
                        <input
                            style={estilos.input}
                            type="text"
                            placeholder="Resumen breve del problema"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                        />
                    </div>
                    <div style={estilos.campo}>
                        <label style={estilos.label}>Descripción <span style={estilos.requerido}>*</span></label>
                        <textarea
                            style={estilos.textarea}
                            placeholder="Describe el problema con detalle: qué ocurrió, cuándo, qué esperabas que pasara..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                        />
                    </div>
                    <div style={estilos.campo}>
                        <label style={estilos.label}>Prioridad</label>
                        <div style={estilos.prioridadOpciones}>
                            {[
                                { valor: 'baja', color: '#36B37E', texto: '🟢 Baja', desc: 'Sin urgencia' },
                                { valor: 'media', color: '#F59800', texto: '🟡 Media', desc: 'Urgencia moderada' },
                                { valor: 'alta', color: '#E53935', texto: '🔴 Alta', desc: 'Urgente' },
                            ].map((op) => (
                                <div
                                    key={op.valor}
                                    style={{
                                        ...estilos.prioridadOpcion,
                                        borderColor: prioridad === op.valor ? op.color : '#DFE1E6',
                                        backgroundColor: prioridad === op.valor ? op.color + '10' : 'white'
                                    }}
                                    onClick={() => setPrioridad(op.valor)}
                                >
                                    <span style={estilos.prioridadTexto}>{op.texto}</span>
                                    <span style={estilos.prioridadDesc}>{op.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={estilos.botones}>
                        <button type="button" style={estilos.botonCancelar} onClick={() => navegar('/dashboard')}>
                            Cancelar
                        </button>
                        <button type="submit" style={{ ...estilos.botonEnviar, opacity: cargando ? 0.7 : 1 }} disabled={cargando}>
                            {cargando ? 'Creando...' : 'Crear Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const estilos = {
    cabeceraPagina: { marginBottom: '24px' },
    titulo: { margin: 0, fontSize: '24px', color: '#1A2B4A', fontWeight: '600' },
    subtitulo: { margin: '4px 0 0 0', color: '#6B778C', fontSize: '14px' },
    tarjeta: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '30px', maxWidth: '700px' },
    error: { backgroundColor: '#FFEBEE', color: '#E53935', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', border: '1px solid #FFCDD2' },
    campo: { marginBottom: '24px' },
    label: { display: 'block', color: '#1A2B4A', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
    requerido: { color: '#E53935' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1A2B4A' },
    textarea: { width: '100%', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1A2B4A', height: '150px', resize: 'vertical', fontFamily: 'inherit' },
    prioridadOpciones: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    prioridadOpcion: { flex: 1, minWidth: '140px', padding: '14px', borderRadius: '8px', border: '2px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', transition: 'all 0.2s' },
    prioridadTexto: { fontSize: '14px', fontWeight: '600', color: '#1A2B4A' },
    prioridadDesc: { fontSize: '12px', color: '#6B778C' },
    botones: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    botonCancelar: { padding: '10px 20px', backgroundColor: 'white', color: '#6B778C', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    botonEnviar: { padding: '10px 24px', backgroundColor: '#2D6BE4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }
};

export default CrearTicket;
