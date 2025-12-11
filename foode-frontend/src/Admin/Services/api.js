const BASE_URL = "http://localhost:8080";

export const API = {
    // --- Auth ---
    adminLogin: async (username, password) => {
        return fetch(`${BASE_URL}/admin/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
    },

    adminLogout: async (token) => {
        return fetch(`${BASE_URL}/admin/signout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    // --- Customer Management ---
    getAllCustomers: async (token) => {
        return fetch(`${BASE_URL}/admin/customers`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    searchCustomers: async (token, keyword) => {
        return fetch(`${BASE_URL}/admin/customers/search?keyword=${keyword}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    updateCustomer: async (token, id, data) => {
        return fetch(`${BASE_URL}/admin/customer/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
    },

    deleteCustomer: async (token, id) => {
        return fetch(`${BASE_URL}/admin/customer/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    // --- Food Management (NEW) ---
    getAllFoods: async (token) => {
        return fetch(`${BASE_URL}/admin/foods`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    searchFoods: async (token, keyword) => {
        return fetch(`${BASE_URL}/admin/foods/search?keyword=${keyword}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    deleteFood: async (token, id) => {
        return fetch(`${BASE_URL}/admin/food/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    // Useful for your AddFoodForm/EditFoodForm later:
    addFood: async (token, formData) => {
        return fetch(`${BASE_URL}/admin/food`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }, // No Content-Type (Browser sets it for Multipart)
            body: formData 
        });
    },

    updateFood: async (token, id, formData) => {
        return fetch(`${BASE_URL}/admin/food/${id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }, // No Content-Type (Browser sets it for Multipart)
            body: formData
        });
    },

    getAllOrders: async (token) => {
        return fetch("http://localhost:8080/admin/orders", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    },

    // 2. Update Order Status
    updateOrderStatus: async (orderId, status, token) => {
        // We send status as a Query Param (?status=COOKING) based on your Controller
        return fetch(`http://localhost:8080/admin/orders/order/${orderId}/status?status=${status}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    }
};