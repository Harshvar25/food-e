import React, { useState } from 'react';
import { useAuth } from "../Context/AuthContext";
import './AddFoodForm.css';

const CATEGORIES = [
    { value: "FULL_MEAL", label: "Full Meal" },
    { value: "SNACK", label: "Snack" },
    { value: "DESSERT", label: "Dessert" },
    { value: "BEVERAGE", label: "Beverage" },
    { value: "APPETIZER", label: "Appetizer" }
];

// 1. New Enum for Spiciness
const SPICINESS_LEVELS = [
    { value: "MILD", label: "Mild" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HOT", label: "Hot" },
    { value: "EXTRA_HOT", label: "Extra Hot" }
];

export default function AddFoodForm({ onClose, onFoodAdded }) {
    const { token } = useAuth();
    
    // 2. Initialize State with NEW Fields
    const [foodData, setFoodData] = useState({
        name: '',
        description: '',
        price: '',
        category: CATEGORIES[0].value,
        
        // New Fields
        ingredients: '',
        calories: '', // string to start, parsed later
        preparationTime: '', 
        spiciness: SPICINESS_LEVELS[0].value,
        isVeg: true,  // Default to Veg
        available: true // Default to In Stock
    });

    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFoodData(prev => ({
            ...prev,
            // Handle checkboxes (boolean) vs normal inputs
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

        if (!imageFile) {
            setError("Please select an image file.");
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            
            // 3. Prepare the JSON Payload (Ensure numbers are numbers)
            const payload = {
                ...foodData,
                price: parseFloat(foodData.price),
                calories: parseFloat(foodData.calories),
                preparationTime: parseInt(foodData.preparationTime)
            };

            formData.append('food', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
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
            onClose(); 

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
                <h2>Add New Food Item</h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* --- ROW 1: Name & Price --- */}
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

                    {/* --- ROW 2: Category & Spiciness --- */}
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

                    {/* --- ROW 3: Calories & Prep Time --- */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="calories">Calories (kcal):</label>
                            <input type="number" id="calories" name="calories" value={foodData.calories} onChange={handleChange} placeholder="e.g. 350" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="preparationTime">Prep Time (mins):</label>
                            <input type="number" id="preparationTime" name="preparationTime" value={foodData.preparationTime} onChange={handleChange} placeholder="e.g. 20" required />
                        </div>
                    </div>

                    {/* --- ROW 4: Switches (Veg & Available) --- */}
                    <div className="form-row checkbox-row">
                        <div className="checkbox-group">
                            <input type="checkbox" id="isVeg" name="isVeg" checked={foodData.isVeg} onChange={handleChange} />
                            <label htmlFor="isVeg">Veg</label>
                        </div>
                        <div className="checkbox-group">
                            <input type="checkbox" id="available" name="available" checked={foodData.available} onChange={handleChange} />
                            <label htmlFor="available">Available</label>
                        </div>
                    </div>

                    {/* --- Ingredients --- */}
                    <div className="form-group">
                        <label htmlFor="ingredients">Ingredients (comma separated):</label>
                        <textarea id="ingredients" name="ingredients" value={foodData.ingredients} onChange={handleChange} rows="2" placeholder="e.g. Flour, Sugar, Milk..."></textarea>
                    </div>

                    {/* --- Description --- */}
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea id="description" name="description" value={foodData.description} onChange={handleChange} rows="3"></textarea>
                    </div>

                    {/* --- File Upload --- */}
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