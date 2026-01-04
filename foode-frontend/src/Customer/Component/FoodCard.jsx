import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomerAPI } from '../Services/CustomerAPI';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton'; 
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box'; 
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function FoodCard({ food, onAddToCart }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loadingCart, setLoadingCart] = useState(false);

    const imageSrc = food.imageData
        ? `data:${food.imageType};base64,${food.imageData}`
        : "https://placehold.co/300x200?text=No+Image";

    const priceDisplay = `₹${food.price ? food.price.toFixed(2) : '0.00'}`;

    useEffect(() => {
        const checkWishlistStatus = async () => {
            const customerId = localStorage.getItem("customerId");
            const token = localStorage.getItem("customer_token");

            if (customerId && token) {
                try {
                    const response = await CustomerAPI.getWishlist(customerId, token);
                    const data = await response.json();
                    
                    if (data && Array.isArray(data)) {
                        const exists = data.some(item => {
                            const idToCompare = item.food ? item.food.id : item.id;
                            return idToCompare === food.id;
                        });
                        setIsWishlisted(exists);
                    }
                } catch (error) {
                    console.error("Error checking wishlist status:", error);
                }
            }
        };
        checkWishlistStatus();
    }, [food.id]);

    const handleWishlistClick = async (e) => {
        e.preventDefault(); 
        e.stopPropagation();

        const token = localStorage.getItem("customer_token");
        const customerId = localStorage.getItem("customerId");

        if (!token || !customerId) {
            alert("Please login to save items.");
            return;
        }

        try {
            if (isWishlisted) {
                await CustomerAPI.removeFromWishlist(customerId, food.id, token);
                setIsWishlisted(false);
            } else {
                await CustomerAPI.addToWishlist(customerId, food.id, token);
                setIsWishlisted(true);
            }
            window.dispatchEvent(new Event("wishlistUpdated"));
        } catch (error) {
            console.error("Error updating wishlist:", error);
        }
    };

    const handleAddToCartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setLoadingCart(true);
        if (onAddToCart) {
            onAddToCart(food);
        }
        setTimeout(() => setLoadingCart(false), 500);
    };

    const VegIcon = () => (
        <Box sx={{ border: '2px solid #2ecc71', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', marginRight: '8px', minWidth: '20px' }}>
            <Box sx={{ backgroundColor: '#2ecc71', width: '10px', height: '10px', borderRadius: '50%' }} />
        </Box>
    );

    const NonVegIcon = () => (
        <Box sx={{ border: '2px solid #e74c3c', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', marginRight: '8px', minWidth: '20px' }}>
            <Box sx={{ backgroundColor: '#e74c3c', width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '10px solid #e74c3c' }} />
        </Box>
    );

    return (
      <Card 
          sx={{ 
              width: 320, 
              height: 480, 
              m: 2, 
              borderRadius: '16px', 
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              position: 'relative',
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
              }
          }}
      >
          <Box sx={{ position: 'relative', height: '200px' }}>
              <Link to={`/food/${food.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardMedia
                      component="img"
                      height="200"
                      image={imageSrc}
                      alt={food.name}
                      sx={{ objectFit: 'cover' }}
                  />
              </Link>
              <Chip 
                label={food.category} 
                size="small" 
                sx={{ 
                    position: 'absolute', top: 10, left: 10, 
                    backgroundColor: 'rgba(255,255,255,0.9)', fontWeight: 700, color: '#333', backdropFilter: 'blur(4px)'
                }} 
              />
              {food.isBestSeller && (
                  <Chip 
                    label="Best Seller" 
                    size="small" 
                    sx={{ 
                        position: 'absolute', top: 10, right: 10, 
                        backgroundColor: '#d97706', color: 'white', fontWeight: 700
                    }} 
                  />
              )}
          </Box>

          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  {food.isVeg ? <VegIcon /> : <NonVegIcon />}
                  <Link to={`/food/${food.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#2d3436', '&:hover': { color: '#2e7d32' } }}>
                          {food.name}
                      </Typography>
                  </Link>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2, 
                  display: '-webkit-box', overflow: 'hidden',
                  WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, 
                  height: '40px', fontSize: '0.85rem'
              }}>
                  {food.description || "No description available."}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f6fa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#636e72', fontWeight: 600 }}>
                      <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {food.preparationTime ? `${food.preparationTime} mins` : "N/A"}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#e17055', fontWeight: 600 }}>
                      <LocalFireDepartmentIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {food.spiciness || "Mild"}
                  </Box>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #dfe6e9', pt: 2 }}>
                  <Box>
                      <Typography variant="h6" sx={{ color: '#2d3436', fontWeight: 800 }}>
                          {priceDisplay}
                      </Typography>
                      {food.originalPrice && (
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999' }}>
                              ₹{food.originalPrice}
                          </Typography>
                      )}
                  </Box>

                  <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        onClick={handleWishlistClick}
                        sx={{ 
                            color: isWishlisted ? '#d63031' : '#b2bec3', 
                            backgroundColor: isWishlisted ? '#ffebee' : '#f5f6fa',
                            '&:hover': { backgroundColor: '#ffebee', color: '#d63031' } 
                        }}
                      >
                          {isWishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                      </IconButton>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddToCartClick}
                        startIcon={<ShoppingCartIcon />}
                        sx={{
                            backgroundColor: '#2d3436',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            '&:hover': { backgroundColor: '#000' }
                        }}
                      >
                          {loadingCart ? "Adding..." : "Add"}
                      </Button>
                  </Box>
              </Box>
          </CardContent>
      </Card>
    );
}