// src/Admin/component/EditFoodForm.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from "../Context/AuthContext";
import './AddFoodForm.css'; // Reusing the CSS file

export default function EditFoodForm({ item, onClose, onFoodUpdated }) {
    const { token } = useAuth();

    const [foodData, setFoodData] = useState({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
    });

    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Reset state when a new item is opened for editing
    useEffect(() => {
        setFoodData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category,
        });
        setImageFile(null);
        setError(null);
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFoodData(prev => ({
            ...prev,
            [name]: value
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

            // Send food data as a JSON Blob named 'food'
            formData.append(
                'food',
                new Blob([JSON.stringify(foodData)], {
                    type: 'application/json'
                })
            );

            // 🎯 FIX: Always send an 'imageFile' part to satisfy the backend's @RequestPart requirement.
            if (imageFile) {
                // Case 1: New file is selected
                formData.append('imageFile', imageFile);
            } else {
                // Case 2: No new file is selected -> Send an empty dummy file
                const dummyFile = new Blob([], { type: 'application/octet-stream' });
                // Note: The third argument ('dummy.txt') is the filename, required for some backends.
                formData.append('imageFile', dummyFile, 'dummy-update-file');
            }

            const response = await fetch(`http://localhost:8080/admin/food/${item.id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Failed to update food: HTTP status ${response.status}.`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    if (errorText) errorMessage += ` Details: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            alert(`Food added successfully: ${data.name}`); // <-- Access 'name' directly
            onFoodUpdated();

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
                <h2>✏️ Edit Food Item: {item.name}</h2>
                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={foodData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Price:</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={foodData.price}
                            onChange={handleChange}
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category:</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={foodData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={foodData.description}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-group file-upload-group">
                        <label htmlFor="imageFile">Update Food Image (Optional):</label>
                        <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <small className="current-image-status">
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