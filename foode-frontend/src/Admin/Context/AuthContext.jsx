import { createContext, useContext, useEffect, useState } from "react";
import { API } from "../Services/api";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        // Restore token on page reload
        return localStorage.getItem("token") || null;
    });

    // LOGIN → save token
    const login = (jwt) => {
        console.log("TOKEN RECEIVED FROM BACKEND:", jwt); // 👈 verify here!

        localStorage.setItem("token", jwt);
        setToken(jwt);
    };

    // LOGOUT → remove token
    const logout = async () => {
        if (token) {
            await API.adminLogout(token);
        }
        setToken(null);
    };


    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}
