import React, { useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import { useAuth } from "../Context/AuthContext";
import { API } from "../Services/api"; // Make sure path is correct
import AddFoodForm from '../component/AddFoodForm';
import FoodCard from '../component/FoodCard';
import EditFoodForm from '../component/EditFoodForm';
import './css/FoodItems.css';
import { Box, CircularProgress, Alert } from '@mui/material';

export default function FoodItems() {

    const [foodItems, setFoodItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [error, setError] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const [inputSearchTerm, setInputSearchTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const { token } = useAuth();

    // Fetch items (Refactored to use API)
    const fetchData = useCallback(async (keyword) => {
        setIsLoading(true);
        setError(null);

        try {
            // Select the correct API call based on keyword presence
            const apiCall = keyword 
                ? API.searchFoods(token, keyword) 
                : API.getAllFoods(token);

            const res = await apiCall;

            if (!res.ok) throw new Error("Failed to fetch food items");

            const data = await res.json();
            setFoodItems(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchData(searchTerm);
    }, [token, searchTerm, fetchTrigger, fetchData]);

    // Delete handler (Refactored to use API)
    const handleDeleteFood = async (id) => {
        if (!window.confirm("Delete this food item?")) return;

        try {
            const res = await API.deleteFood(token, id);

            if (!res.ok) throw new Error("Delete failed");

            alert("Item deleted.");
            setFetchTrigger(prev => prev + 1);
        } catch (err) {
            alert(err.message);
        }
    };

    // EDIT CLICK → open EditFoodForm
    const handleEditClick = (item) => {
        setEditingItem(item);
        setShowEditForm(true);
    };

    // CLOSE edit popup
    const handleEditClose = () => {
        setShowEditForm(false);
        setEditingItem(null);
    };

    // REFRESH after update
    const handleFoodUpdated = () => {
        setShowEditForm(false);
        setEditingItem(null);
        setFetchTrigger(prev => prev + 1);
    };

    if (isLoading) return <div className="loading-state"><CircularProgress /> Loading...</div>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <div className="food-items-page">
            <header>
                <h1>Food Items Management</h1>
            </header>

            <div className="controls-bar"> 
                
                {/* Add Button */}
                <button className="add-new-button" onClick={() => setShowAddForm(true)}>
                    + Add New Food Item
                </button>

                {/* Search Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setSearchTerm(inputSearchTerm);
                    }}
                    style={{ display: 'flex', gap: '10px' }}
                >
                    <input
                        type="text"
                        placeholder="Search..."
                        value={inputSearchTerm}
                        onChange={(e) => setInputSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="save-button">Search</button>
                </form>

            </div>

            {/* Add Form */}
            {showAddForm && (
                <AddFoodForm
                    onClose={() => setShowAddForm(false)}
                    onFoodAdded={() => setFetchTrigger(prev => prev + 1)}
                />
            )}

            {/* Edit Form */}
            {showEditForm && editingItem && (
                <EditFoodForm
                    item={editingItem}
                    onClose={handleEditClose}
                    onFoodUpdated={handleFoodUpdated}
                />
            )}

            {/* List */}
            <section className="data-cards">
                <h2>Current Food Inventory</h2>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                    {foodItems.length ? (
                        foodItems.map((item) => (
                            <FoodCard
                                key={item.id}
                                item={item}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteFood}
                            />
                        ))
                    ) : (
                        <Typography>No items found.</Typography>
                    )}
                </Box>
            </section>
        </div>
    );
}