import axios from 'axios';

export const CustomerAPI = {

    customerSignUp: async (formData) => {
        return fetch("http://localhost:8080/customer/signup", {
            method: "POST",
            body: formData, 
        });
    },

    customerSignIn: async (email, password) => {
        return fetch("http://localhost:8080/customer/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    },

    customerLogout: async (token) => {
        return fetch("http://localhost:8080/customer/signout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    },

    updateCustomer: async (id, formData, token) => {
        return fetch(`http://localhost:8080/customer/${id}`, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${token}` 
            },
            body: formData
        });
    },

    deleteCustomer: async (id, token) => {
        return fetch(`http://localhost:8080/customer/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    getCustomerById: async (id, token) => {
        try {
            const response = await axios.get(`http://localhost:8080/customer/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            return response;
        } catch (error) { throw error; }
    },

    getAllFoods: async (token) => {
        return fetch("http://localhost:8080/customer/foods", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    },

    getFoodById: async (id, token) => {
        return fetch(`http://localhost:8080/customer/foods/${id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    searchFood: async (keyword, token) => {
        return fetch(`http://localhost:8080/customer/foods/search?keyword=${encodeURIComponent(keyword)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    },

    addToWishlist: async (customerId, foodId, token) => {
        return fetch(`http://localhost:8080/customer/wishlist/add?customerId=${customerId}&foodId=${foodId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    removeFromWishlist: async (customerId, foodId, token) => {
        return fetch(`http://localhost:8080/customer/wishlist/remove?customerId=${customerId}&foodId=${foodId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    getWishlist: async (customerId, token) => {
        try {
            const response = await axios.get(`http://localhost:8080/customer/wishlist/${customerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            return response;
        } catch (error) { throw error; }
    },

    moveToCart: async (wishlistId, token) => {
        try {
            const response = await axios.post(`http://localhost:8080/customer/wishlist/move-to-cart/${wishlistId}`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            return response;
        } catch (error) { throw error; }
    },

    getCart: async (customerId, token) => {
        try {
            const response = await axios.get(`http://localhost:8080/cart/${customerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            return response; 
        } catch (error) { throw error; }
    },

    addFoodToCart: async (customerId, foodId, quantity, token) => {
        const url = `http://localhost:8080/cart/${customerId}/add?foodId=${foodId}&quantity=${quantity || 1}`;
        return fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    updateCartQuantity: async (customerId, cartItemId, quantity, token) => {
        try {
            return await axios.put(
                `http://localhost:8080/cart/update/${customerId}/${cartItemId}`, 
                { quantity: quantity },
                { headers: { "Authorization": `Bearer ${token}` } }
            );
        } catch (error) { throw error; }
    },

    removeFromCart: async (customerId, cartItemId, token) => {
        try {
            return await axios.delete(`http://localhost:8080/cart/remove/${customerId}/${cartItemId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (error) { throw error; }
    },

    // ✅ NEW: Place Order Function
    placeOrder: async (customerId, address, token) => {
        return fetch(`http://localhost:8080/${customerId}/order/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // We pass the address inside an object to match the DTO expectation
            body: JSON.stringify({ address: address }) 
        });
    },

    getCustomerOrders: async (customerId, token) => {
    return fetch(`http://localhost:8080/customer/${customerId}/orders`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
}
};