// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminSignIn from "./Admin/Pages/AdminSignIn";
import Dashboard from "./Admin/Pages/Dashboard";
import { AuthProvider } from "./Admin/Context/AuthContext";
import CustomerList from "./Admin/Pages/CustomerList";
import FoodItems from "./Admin/Pages/FoodItems";
import CustomerSignIn from "./Customer/Pages/CustomerSignIn";
import { CustomerAuthProvider } from "./Customer/Context/CustomerAuthContext";
import CustomerSignUp from "./Customer/Pages/CustomerSignUp";
import CustomerDashboard from "./Customer/Pages/CustomerDashboard";
import Wishlist from "./Customer/Pages/Wishlist";
import Cart from "./Customer/Pages/Cart";
import UserProfile from "./Customer/Pages/UserProfile";
import AboutUs from "./Customer/Pages/AboutUs";
import MyOrders from "./Customer/Pages/MyOrders";
import AdminOrders from "./Admin/Pages/AdminOrders";
import FoodDetails from "./Customer/Pages/FoodDetails"; 

// Import the new security component
import ProtectedRoute from "./ProtectedRoute";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    return (
        <BrowserRouter>
            <CustomerAuthProvider>
                <AuthProvider>
                    <div className="App">
                        <ToastContainer position="top-center" />

                        <Routes>
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="/login" element={<CustomerSignIn />} />
                            <Route path="/signup" element={<CustomerSignUp />} />
                            <Route path="/admin" element={<AdminSignIn />} />

                            <Route element={<ProtectedRoute allowedRole="CUSTOMER" />}>
                                <Route path="/customerDashboard" element={<CustomerDashboard />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/profile" element={<UserProfile />} />
                                <Route path="/orders" element={<MyOrders />} />
                                <Route path="/about" element={<AboutUs />} />
                                <Route path="/food/:id" element={<FoodDetails />} />
                            </Route>

                            <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
                                <Route path="/dashboard" element={<Dashboard />}>
                                    <Route index element={<h2>Welcome to the Dashboard!</h2>} />
                                    <Route path="customers" element={<CustomerList />} />
                                    <Route path="foods" element={<FoodItems />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                </Route>
                            </Route>

                        </Routes>
                    </div>
                </AuthProvider>
            </CustomerAuthProvider>
        </BrowserRouter>
    );
}