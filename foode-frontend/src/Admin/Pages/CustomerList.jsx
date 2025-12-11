import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { API } from "../Services/api"; 
import './css/CustomerList.css';

export default function CustomerList() {
    const { token } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);
    
    // Edit States
    const [cusId, setCusId] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    // Search States
    const [searchTerm, setSearchTerm] = useState(""); 
    const [inputSearchTerm, setInputSearchTerm] = useState(""); 

    // Helper to handle the API response logic centrally
    const handleApiCall = (apiPromise) => {
        setLoading(true);
        setError(null);
        
        apiPromise
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to fetch customer data.");
                }
                return res.json();
            })
            .then(data => {
                setCustomers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading customers:", err);
                setError(err.message || "Could not load customers.");
                setCustomers([]); // Clear list on error
                setLoading(false);
            });
    };

    // SEARCH SUBMIT FUNCTION
    const handleFormSubmit = (e) => {
        e.preventDefault(); 
        setSearchTerm(inputSearchTerm);
    };

    // useEffect: Triggers initial fetch, delete/update refresh, AND search submit.
    useEffect(() => {
        if (!token) return;

        if (searchTerm.trim() === "") {
            // Call API: Get All
            handleApiCall(API.getAllCustomers(token));
        } else {
            // Call API: Search
            handleApiCall(API.searchCustomers(token, searchTerm));
        }
    }, [token, searchTerm, fetchTrigger]);


    // --- EDITING LOGIC ---

    const handleEditClick = (customer) => {
        setCusId(customer.customerId);
        setEditedData({
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            // Only include password if you intend to edit it, otherwise consider removing it for security
            password: customer.password 
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = () => {
        // Call API: Update
        API.updateCustomer(token, cusId, editedData)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to update customer. Status: ${res.status}`);
            }
            return res.json(); // Consuming json if needed, or just proceed
        })
        .then(() => {
            setCusId(null);
            alert(`Customer ID ${cusId} updated successfully.`);
            setFetchTrigger(prev => prev + 1); // Refresh list
        })
        .catch(err => {
            console.error("Update error:", err);
            setError(err.message);
            alert(`Error updating customer: ${err.message}`);
        });
    };

    const handleCancelEdit = () => {
        setCusId(null);
        setEditedData({});
    };

    // --- DELETE LOGIC ---

    const handleDelete = (customerId) => {
        if (!window.confirm(`Are you sure you want to delete customer ID: ${customerId}?`)) {
            return;
        }

        // Call API: Delete
        API.deleteCustomer(token, customerId)
        .then(res => {
            if (res.status === 200 || res.status === 204) {
                alert(`Customer ID ${customerId} deleted successfully.`);
                setFetchTrigger(prev => prev + 1); // Refresh list
            } else {
                throw new Error("Failed to delete customer. Status: " + res.status);
            }
        })
        .catch(err => {
            console.error("Error deleting customer:", err);
            setError(`Error deleting customer: ${err.message}`);
            alert(`Error deleting customer: ${err.message}`);
        });
    };

    if (loading) return <div className="loading-state">Loading customer data...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;

    
    return (
        <div className="dashboard-container">
            {/* ... Paste your original JSX here ... */}
            {/* Need me to paste the JSX back too? let me know! */}
            <div className="customer-list-page">
            <header>
                <h1 className="list-title">Customer Management</h1>
            </header>

            <section className="content-overview">
                <p>Total Customers: {customers.length}</p>
                
                {/* Search Form */}
                <form onSubmit={handleFormSubmit} style={{display: 'flex', gap: '10px'}}>
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={inputSearchTerm}
                        onChange={(e) => setInputSearchTerm(e.target.value)} 
                        className="search-input"
                        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '300px'}}
                    />
                    <button type="submit" className="action-btn save-button">
                        Search
                    </button>
                </form>
            </section>
            
            <div className="table-container">
                <table className="customer-list-table">
                    <thead className="table-header">
                        <tr>
                            <th className="table-th">ID</th>
                            <th className="table-th">Name</th>
                            <th className="table-th">Email</th>
                            <th className="table-th">Phone</th>
                            <th className="table-th">Address</th>
                            <th className="table-th text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {customers.map(c => {
                            const isEditing = c.customerId === cusId;
                            return (
                                <tr key={c.customerId} className="table-row">
                                    <td className="table-td">{c.customerId}</td>
                                    
                                    <td className="table-td">
                                        {isEditing ? (
                                            <input type="text" name="name" value={editedData.name} onChange={handleEditChange} className="inline-input" />
                                        ) : c.name}
                                    </td>
                                    
                                    <td className="table-td">
                                        {isEditing ? (
                                            <input type="email" name="email" value={editedData.email} onChange={handleEditChange} className="inline-input" />
                                        ) : c.email}
                                    </td>
                                    
                                    <td className="table-td">
                                        {isEditing ? (
                                            <input type="text" name="phone" value={editedData.phone} onChange={handleEditChange} className="inline-input" />
                                        ) : c.phone}
                                    </td>
                                    
                                    <td className="table-td">
                                        {isEditing ? (
                                            <input type="text" name="address" value={editedData.address} onChange={handleEditChange} className="inline-input" />
                                        ) : c.address}
                                    </td>
                                    
                                    <td className="table-td actions-cell">
                                        {isEditing ? (
                                            <>
                                                <button onClick={handleSaveEdit} className="action-btn save-button">Save</button>
                                                <button onClick={handleCancelEdit} className="action-btn cancel-button">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(c)} className="action-btn update-btn">Edit</button>
                                                <button onClick={() => handleDelete(c.customerId)} className="action-btn delete-btn">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {customers.length === 0 && <div className="empty-state">No customers found.</div>}
            </div>
        </div>
        </div>
    );
}