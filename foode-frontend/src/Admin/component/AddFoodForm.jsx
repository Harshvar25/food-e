import React, { useState } from 'react';
import { useAuth } from "../Context/AuthContext";
import './AddFoodForm.css';

// 1. Define your categories to match the Backend Enum exactly
const CATEGORIES = [
    { value: "FULL_MEAL", label: "Full Meal" },
    { value: "SNACK", label: "Snack" },
    { value: "DESSERT", label: "Dessert" },
    { value: "BEVERAGE", label: "Beverage" },
    { value: "APPETIZER", label: "Appetizer" }
];

export default function AddFoodForm({ onClose, onFoodAdded }) {
    const { token } = useAuth();
    // Initialize category with the first option or empty
    const [foodData, setFoodData] = useState({
        name: '',
        description: '',
        price: '',
        category: CATEGORIES[0].value, // Default to first item to avoid empty errors
    });

    // ... keep your existing state for images and submitting ...
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFoodData(prev => ({
            ...prev,
            [name]: name === 'price' ? value : value
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        // ... keep your existing handleSubmit logic exactly as is ...
        // Your logic for FormData and fetch is already correct!
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!imageFile) {
            setError("Please select an image file.");
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('food', new Blob([JSON.stringify(foodData)], { type: 'application/json' }));
            formData.append('imageFile', imageFile);

            const response = await fetch("http://localhost:8080/admin/food", {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add food");
            }

            const data = await response.json();
            alert(`Food added successfully: ${data.name}`);
            onFoodAdded();
            onClose(); // Close modal on success

        } catch (err) {
            console.error("Submission Error:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="add-food-form">
                <h2>➕ Add New Food Item</h2>
                <form onSubmit={handleSubmit}>
                    {/* Name Input - No Change */}
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" value={foodData.name} onChange={handleChange} required />
                    </div>

                    {/* Price Input - No Change */}
                    <div className="form-group">
                        <label htmlFor="price">Price:</label>
                        <input type="number" id="price" name="price" value={foodData.price} onChange={handleChange} step="0.01" required />
                    </div>

                    {/* 2. CHANGE: Category is now a Select Dropdown */}
                    <div className="form-group">
                        <label htmlFor="category">Category:</label>
                        <select
                            id="category"
                            name="category"
                            value={foodData.category}
                            onChange={handleChange}
                            required
                            className="form-control" // Add css class for styling if needed
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description Input - No Change */}
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea id="description" name="description" value={foodData.description} onChange={handleChange} rows="3"></textarea>
                    </div>

                    {/* File Input - No Change */}
                    <div className="form-group file-upload-group">
                        <label htmlFor="imageFile">Food Image:</label>
                        <input type="file" id="imageFile" name="imageFile" onChange={handleFileChange} accept="image/*" required />
                    </div>

                    {error && <p className="error-message">Error: {error}</p>}

                    <div className="form-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Food'}
                        </button>
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}