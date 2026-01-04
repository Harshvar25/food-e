const BASE_URL = "http://localhost:8080";

export const CustomerAPI = {
    customerSignUp: async (formData) => {
        return fetch(`${BASE_URL}/customer/signup`, {
            method: "POST",
            body: formData,
        });
    },

    customerSignIn: async (email, password) => {
        return fetch(`${BASE_URL}/customer/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    },

    customerLogout: async (token) => {
        return fetch(`${BASE_URL}/customer/signout`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    },

    verifyPassword: async (id, currentPassword, token) => {
        return fetch(`${BASE_URL}/customer/${id}/verify-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword })
        });
    },

    updateCustomer: async (id, formData, token) => {
        return fetch(`${BASE_URL}/customer/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
    },

    deleteCustomer: async (id, token) => {
        return fetch(`${BASE_URL}/customer/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    getCustomerById: async (id, token) => {
        return fetch(`${BASE_URL}/customer/${id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    getAllFoods: async (token) => {
        return fetch(`${BASE_URL}/customer/foods`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    },

    getFoodById: async (id, token) => {
        return fetch(`${BASE_URL}/customer/food/${id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    searchFood: async (keyword, token) => {
        return fetch(`${BASE_URL}/customer/foods/search?keyword=${encodeURIComponent(keyword)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    },

    addToWishlist: async (customerId, foodId, token) => {
        return fetch(`${BASE_URL}/customer/wishlist/add?customerId=${customerId}&foodId=${foodId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    removeFromWishlist: async (customerId, foodId, token) => {
        return fetch(`${BASE_URL}/customer/wishlist/remove?customerId=${customerId}&foodId=${foodId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    getWishlist: async (customerId, token) => {
        return fetch(`${BASE_URL}/customer/wishlist/${customerId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    moveToCart: async (wishlistId, token) => {
        return fetch(`${BASE_URL}/customer/wishlist/move-to-cart/${wishlistId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    getCart: async (customerId, token) => {
        return fetch(`${BASE_URL}/cart/${customerId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    addFoodToCart: async (customerId, foodId, quantity, token) => {
        const url = `${BASE_URL}/cart/${customerId}/add?foodId=${foodId}&quantity=${quantity || 1}`;
        return fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    updateCartQuantity: async (customerId, cartItemId, quantity, token) => {
        return fetch(`${BASE_URL}/cart/update/${customerId}/${cartItemId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ quantity: quantity })
        });
    },

    removeFromCart: async (customerId, cartItemId, token) => {
        return fetch(`${BASE_URL}/cart/remove/${customerId}/${cartItemId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    },

    placeOrder: async (customerId, address, token) => {
        return fetch(`${BASE_URL}/${customerId}/order/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ address: address })
        });
    },

    getCustomerOrders: async (customerId, token) => {
        return fetch(`${BASE_URL}/customer/${customerId}/orders`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    },

    getAddresses: async (customerId, token) => {
        return fetch(`${BASE_URL}/customer/${customerId}/address`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
    },

    addAddress: async (customerId, addressData, token) => {
        return fetch(`${BASE_URL}/customer/${customerId}/address`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addressData)
        });
    },

    updateAddress: async (customerId, addressData, token) => {
        return fetch(`${BASE_URL}/customer/${customerId}/profile/address`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addressData)
        });
    },

    deleteAddress: async (addressId, token) => {
        return fetch(`${BASE_URL}/customer/address/${addressId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    }
};