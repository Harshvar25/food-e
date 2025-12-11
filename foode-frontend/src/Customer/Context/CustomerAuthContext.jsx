import { createContext, useContext, useEffect, useState } from "react";
import { CustomerAPI } from "../Services/CustomerAPI"; 
const CustomerAuthContext = createContext();

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export function CustomerAuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        // Use a unique key for customer token
        return localStorage.getItem("customer_token") || null; 
    });

    const login = (jwt) => {
        localStorage.setItem("customer_token", jwt);
        setToken(jwt);
    };

    const logout = async () => {
        if (token) {
            await CustomerAPI.customerLogout(token); 
        }
        localStorage.removeItem("customer_token"); // Use unique key
        setToken(null);
    };

    return (
        <CustomerAuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </CustomerAuthContext.Provider>
    );
}