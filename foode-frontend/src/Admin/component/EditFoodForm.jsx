// src/Admin/component/EditFoodForm.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from "../Context/AuthContext";
import './AddFoodForm.css'; // Reusing the updated CSS

// Constants for Dropdowns
const CATEGORIES = [
    { value: "FULL_MEAL", label: "Full Meal" },
    { value: "SNACK", label: "Snack" },
    { value: "DESSERT", label: "Dessert" },
    { value: "BEVERAGE", label: "Beverage" },
    { value: "APPETIZER", label: "Appetizer" }
];

const SPICINESS_LEVELS = [
    { value: "MILD", label: "Mild" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HOT", label: "Hot" },
    { value: "EXTRA_HOT", label: "Extra Hot" }
];

export default function EditFoodForm({ item, onClose, onFoodUpdated }) {
    const { token } = useAuth();

    // 1. Initialize State with ALL fields
    const [foodData, setFoodData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        ingredients: '',
        calories: '',
        preparationTime: '',
        spiciness: 'MILD',
        isVeg: true,
        available: true
    });

    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 2. Load data when 'item' changes
    useEffect(() => {
        if (item) {
            setFoodData({
                name: item.name || '',
                description: item.description || '',
                price: item.price || '',
                category: item.category || CATEGORIES[0].value,
                // Load new fields safely
                ingredients: item.ingredients || '',
                calories: item.calories || '',
                preparationTime: item.preparationTime || '',
                spiciness: item.spiciness || 'MILD',
                isVeg: item.isVeg !== undefined ? item.isVeg : true,
                available: item.available !== undefined ? item.available : true
            });
        }
        setImageFile(null);
        setError(null);
    }, [item]);

    // 3. Handle Inputs (Text vs Checkbox)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFoodData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // 4. Prepare Payload with correct data types
            const payload = {
                ...foodData,
                price: parseFloat(foodData.price),
                calories: parseFloat(foodData.calories),
                preparationTime: parseInt(foodData.preparationTime)
            };

            formData.append('food', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

            // 5. Image Logic (Preserving your robust dummy logic)
            if (imageFile) {
                formData.append('imageFile', imageFile);
            } else {
                // Send dummy file if backend requires a file part
                const dummyFile = new Blob([], { type: 'application/octet-stream' });
                formData.append('imageFile', dummyFile, 'dummy-update-file');
            }

            const response = await fetch(`http://localhost:8080/admin/food/${item.id}`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update food");
            }

            const data = await response.json();
            alert(`Food updated successfully: ${data.name}`);
            onFoodUpdated(); 
            onClose();

        } catch (err) {
            console.error("Update Error:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="add-food-form">
                <h2>Edit Food Item</h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* ROW 1: Name & Price */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input type="text" id="name" name="name" value={foodData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price (₹):</label>
                            <input type="number" id="price" name="price" value={foodData.price} onChange={handleChange} step="0.01" required />
                        </div>
                    </div>

                    {/* ROW 2: Category & Spiciness */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <select id="category" name="category" value={foodData.category} onChange={handleChange} className="form-control">
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="spiciness">Spiciness:</label>
                            <select id="spiciness" name="spiciness" value={foodData.spiciness} onChange={handleChange} className="form-control">
                                {SPICINESS_LEVELS.map(lvl => (
                                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ROW 3: Calories & Prep Time */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="calories">Calories (kcal):</label>
                            <input type="number" id="calories" name="calories" value={foodData.calories} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="preparationTime">Prep Time (mins):</label>
                            <input type="number" id="preparationTime" name="preparationTime" value={foodData.preparationTime} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* ROW 4: Checkboxes */}
                    <div className="form-row checkbox-row">
                        <div className="checkbox-group">
                            <input type="checkbox" id="isVeg" name="isVeg" checked={foodData.isVeg} onChange={handleChange} />
                            <label htmlFor="isVeg">Vegetarian</label>
                        </div>
                        <div className="checkbox-group">
                            <input type="checkbox" id="available" name="available" checked={foodData.available} onChange={handleChange} />
                            <label htmlFor="available">In Stock</label>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="form-group">
                        <label htmlFor="ingredients">Ingredients (comma separated):</label>
                        <textarea id="ingredients" name="ingredients" value={foodData.ingredients} onChange={handleChange} rows="2"></textarea>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea id="description" name="description" value={foodData.description} onChange={handleChange} rows="3"></textarea>
                    </div>

                    {/* Image Upload */}
                    <div className="form-group file-upload-group">
                        <label htmlFor="imageFile">Update Image (Optional):</label>
                        <input type="file" id="imageFile" name="imageFile" onChange={handleFileChange} accept="image/*" />
                        <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                            {imageFile ? 'New image selected.' : 'Current image will be kept unless a new one is uploaded.'}
                        </small>
                    </div>

                    {error && <p className="error-message">Error: {error}</p>}

                    <div className="form-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Save Changes'}
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