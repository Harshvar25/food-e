import * as React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton'; 
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box'; 
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; // For Spiciness
import Chip from '@mui/material/Chip';

export default function FoodCard({ item, onEdit, onDelete }) {
    
    const imgSrc = item.imageData 
      ? `data:${item.imageType};base64,${item.imageData}`
      : "https://placehold.co/300x200?text=No+Image";
      
    const priceDisplay = `₹${item.price ? item.price.toFixed(2) : '0.00'}`;

    // Helper for Veg/Non-Veg Icon
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
          {/* 1. Image Section */}
          <Box sx={{ position: 'relative', height: '200px' }}>
              <CardMedia
                  component="img"
                  height="200"
                  image={imgSrc}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
              />
              {/* Category Badge Overlay */}
              <Chip 
                label={item.category} 
                size="small" 
                sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    left: 10, 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    fontWeight: 700,
                    color: '#333',
                    backdropFilter: 'blur(4px)'
                }} 
              />
          </Box>

          {/* 2. Content Body */}
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 2, pb: 1 }}>
              
              {/* Title Row with Veg/Non-Veg Icon */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  {item.isVeg ? <VegIcon /> : <NonVegIcon />}
                  <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#2d3436' }}>
                      {item.name}
                  </Typography>
              </Box>

              {/* Description */}
              <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2, 
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2, // Limits to 2 lines
                  height: '40px',
                  fontSize: '0.85rem'
              }}>
                  {item.description || "No description available."}
              </Typography>

              {/* Meta Data Row (Prep Time & Spiciness) */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f6fa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#636e72', fontWeight: 600 }}>
                      <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {item.preparationTime ? `${item.preparationTime} mins` : "N/A"}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#e17055', fontWeight: 600 }}>
                      <LocalFireDepartmentIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {item.spiciness || "Mild"}
                  </Box>
              </Box>

              {/* Spacer to push footer to bottom */}
              <Box sx={{ flexGrow: 1 }} />

              {/* 3. Footer: Price & Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #dfe6e9', pt: 2 }}>
                  <Typography variant="h6" sx={{ color: '#2d3436', fontWeight: 800 }}>
                      {priceDisplay}
                  </Typography>

                  <Box>
                      <IconButton 
                        aria-label="edit" 
                        size="small" 
                        onClick={() => onEdit(item)}
                        sx={{ 
                            color: '#0984e3', 
                            backgroundColor: '#e3f2fd', 
                            mr: 1,
                            '&:hover': { backgroundColor: '#bbdefb' } 
                        }}
                      >
                          <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        aria-label="delete" 
                        size="small" 
                        onClick={() => onDelete(item.id)}
                        sx={{ 
                            color: '#d63031', 
                            backgroundColor: '#ffebee',
                            '&:hover': { backgroundColor: '#ffcdd2' }
                        }}
                      >
                          <DeleteIcon fontSize="small" />
                      </IconButton>
                  </Box>
              </Box>

          </CardContent>
      </Card>
    );
}