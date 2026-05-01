import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProveedor, useAuth } from './contexto/AuthContexto';
import Login from './paginas/Login';
import Dashboard from './paginas/Dashboard';
import CrearTicket from './paginas/CrearTicket';
import DetalleTicket from './paginas/DetalleTicket';
import AdminPanel from './paginas/AdminPanel';
import Perfil from './paginas/Perfil';
import CambiarPassword from './paginas/CambiarPassword';
import Layouts from './paginas/Layouts';

const RutaProtegida = ({ children }) => {
    const { usuario } = useAuth();
    if (!usuario) return <Navigate to="/" />;
    if (usuario.primer_login === '1' || usuario.primer_login === 1) return <Navigate to="/cambiar-password" />;
    return <Layouts>{children}</Layouts>;
};

const App = () => {
    return (
        <AuthProveedor>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/cambiar-password" element={<CambiarPassword />} />
                    <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
                    <Route path="/crear-ticket" element={<RutaProtegida><CrearTicket /></RutaProtegida>} />
                    <Route path="/ticket/:id" element={<RutaProtegida><DetalleTicket /></RutaProtegida>} />
                    <Route path="/admin" element={<RutaProtegida><AdminPanel /></RutaProtegida>} />
                    <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
                </Routes>
            </BrowserRouter>
        </AuthProveedor>
    );
};

export default App;
