import React, { createContext, useState, useContext } from 'react';

const AuthContexto = createContext();

export const AuthProveedor = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');
        const nombre = localStorage.getItem('nombre');
        const id = localStorage.getItem('id');
        const email = localStorage.getItem('email');
        const primer_login = localStorage.getItem('primer_login');
        return token ? { token, rol, nombre, id, email, primer_login } : null;
    });

    const login = (datos) => {
        localStorage.setItem('token', datos.token);
        localStorage.setItem('rol', datos.rol);
        localStorage.setItem('nombre', datos.nombre);
        localStorage.setItem('id', datos.id);
        localStorage.setItem('email', datos.email);
        localStorage.setItem('primer_login', datos.primer_login);
        setUsuario(datos);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('nombre');
        localStorage.removeItem('id');
        localStorage.removeItem('email');
        localStorage.removeItem('primer_login');
        setUsuario(null);
    };

    const actualizarPrimerLogin = () => {
        localStorage.setItem('primer_login', 0);
        setUsuario(prev => ({ ...prev, primer_login: 0 }));
    };

    return (
        <AuthContexto.Provider value={{ usuario, login, logout, actualizarPrimerLogin }}>
            {children}
        </AuthContexto.Provider>
    );
};

export const useAuth = () => useContext(AuthContexto);
